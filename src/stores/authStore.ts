import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/neon';
import type { User, Workspace, WorkspaceMember } from '../types';

const DEFAULT_ETAPAS = [
  { name: 'Base', position: 0, is_default: true },
  { name: 'Lead Mapeado', position: 1, is_default: false },
  { name: 'Tentando Contato', position: 2, is_default: false },
  { name: 'Conexão Iniciada', position: 3, is_default: false },
  { name: 'Desqualificado', position: 4, is_default: false },
  { name: 'Qualificado', position: 5, is_default: false },
  { name: 'Reunião Agendada', position: 6, is_default: false },
];

type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  name: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}

function toUser(authUser: AuthUser, profile?: Partial<ProfileRow> | null): User {
  const email = profile?.email || authUser.email || '';
  const name = profile?.name || authUser.name || email.split('@')[0] || 'Usuário';

  return {
    id: authUser.id,
    email,
    name,
  };
}

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (workspace: Workspace) => Promise<void>;
  loadMembers: () => Promise<void>;
  createDefaultWorkspace: (userName: string) => Promise<void>;
  ensureUserProfile: (user: User) => Promise<void>;
  ensureDefaultEtapas: (workspaceId: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      workspace: null,
      workspaces: [],
      members: [],
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signIn.email({
            email,
            password,
          });
          if (error) {
            set({ error: error.message });
            throw error;
          }

          if (data.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const user = toUser(data.user, profile);
            set({ user });
            await get().ensureUserProfile(user);
            await get().loadWorkspaces();
          }
        } catch (err: unknown) {
          const errorMsg = getErrorMessage(err, 'Erro ao fazer login');
          if (!errorMsg.includes('Invalid') && !errorMsg.includes('credentials')) {
            set({ error: errorMsg });
          }
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp.email({
            email,
            password,
            name,
          });

          if (error) {
            const errorMsg = getErrorMessage(error, 'Erro ao criar conta');
            set({ error: errorMsg });
            throw new Error(errorMsg);
          }

          if (!data.user) {
            throw new Error('Conta criada, mas a sessão não foi retornada pelo Neon Auth.');
          }

          const user = toUser(data.user, { name, email });
          set({ user });
          await get().ensureUserProfile(user);
          await get().createDefaultWorkspace(user.name);

          return { needsVerification: false };
        } catch (err: unknown) {
          const errorMsg = getErrorMessage(err, 'Erro ao criar conta');
          if (!errorMsg.includes('User already')) {
            set({ error: errorMsg });
          }
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          workspace: null,
          workspaces: [],
          members: [],
          error: null,
        });
      },

      loadWorkspaces: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          await get().ensureUserProfile(user);

          const { data, error } = await supabase
            .from('workspace_members')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          const workspaceIds = data?.map(member => member.workspace_id) || [];
          if (workspaceIds.length === 0) {
            await get().createDefaultWorkspace(user.name);
            return;
          }

          const { data: workspacesData, error: workspacesError } = await supabase
            .from('workspaces')
            .select('*')
            .in('id', workspaceIds);

          if (workspacesError) throw workspacesError;

          const workspaces = (workspacesData as Workspace[]) || [];
          const currentWorkspace = get().workspace;
          const selectedWorkspace =
            workspaces.find(workspace => workspace.id === currentWorkspace?.id) || workspaces[0] || null;

          set({
            workspaces,
            workspace: selectedWorkspace,
          });

          if (selectedWorkspace) {
            await get().ensureDefaultEtapas(selectedWorkspace.id);
            await get().loadMembers();
          }
        } catch (err: unknown) {
          const errorMsg = getErrorMessage(err, 'Erro ao carregar workspace');
          set({ error: errorMsg, workspace: null, workspaces: [] });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      ensureUserProfile: async (user: User) => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          return;
        }

        const { error: insertError } = await supabase.from('user_profiles').insert({
          id: user.id,
          email: user.email,
          name: user.name,
        });

        if (insertError) throw insertError;
      },

      selectWorkspace: async (workspace) => {
        set({ workspace });
        await get().ensureDefaultEtapas(workspace.id);
        await get().loadMembers();
      },

      loadMembers: async () => {
        const { workspace } = get();
        if (!workspace) return;

        const { data, error } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', workspace.id);

        if (error) throw error;

        // Fetch user details separately
        const userIds = data?.map(m => m.user_id) || [];
        if (userIds.length === 0) {
          set({ members: [] });
          return;
        }

        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', userIds);

        if (usersError) throw usersError;

        const members = data?.map((member: WorkspaceMember) => ({
          ...member,
          user: usersData?.find((profile: ProfileRow) => profile.id === member.user_id)
        })) || [];

        set({ members: (members as unknown as WorkspaceMember[]) });
      },

      createDefaultWorkspace: async (userName: string) => {
        const { user } = get();
        if (!user) return;

        const workspaceName = `${userName}'s Workspace`;
        await get().ensureUserProfile(user);

        const { data: existingMemberships, error: membershipLoadError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('user_id', user.id);

        if (membershipLoadError) throw membershipLoadError;

        const existingWorkspaceId = existingMemberships?.[0]?.workspace_id;
        if (existingWorkspaceId) {
          await get().loadWorkspaces();
          return;
        }

        const { data: workspace, error: wsError } = await supabase
          .from('workspaces')
          .insert({ name: workspaceName })
          .select()
          .single();

        if (wsError) throw wsError;

        const { error: memberError } = await supabase.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin',
        });

        if (memberError) throw memberError;

        await get().ensureDefaultEtapas(workspace.id);

        const workspaces = [workspace as Workspace];
        set({
          workspace: workspaces[0],
          workspaces,
        });
      },

      ensureDefaultEtapas: async (workspaceId: string) => {
        const { data, error } = await supabase
          .from('funil_etapas')
          .select('id')
          .eq('workspace_id', workspaceId)
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) return;

        const { error: etapasError } = await supabase.from('funil_etapas').insert(
          DEFAULT_ETAPAS.map(etapa => ({ ...etapa, workspace_id: workspaceId }))
        );

        if (etapasError) throw etapasError;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        workspace: state.workspace,
        workspaces: state.workspaces,
      }),
    }
  )
);

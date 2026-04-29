import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/neon';
import type { User, Workspace, WorkspaceMember } from '../types';

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  selectWorkspace: (workspace: Workspace) => Promise<void>;
  loadMembers: () => Promise<void>;
  createDefaultWorkspace: (userName: string) => Promise<void>;
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
          if (error) throw error;

          if (data.user) {
            // Buscar perfil do usuário
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: profile?.name || data.user.email!.split('@')[0],
            };

            set({ user });
            await get().loadWorkspaces();
          }
        } catch (err: any) {
          set({ error: err.message });
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
          if (error) throw error;

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name,
            };

            set({ user });
            await get().createDefaultWorkspace(name);
          }
        } catch (err: any) {
          set({ error: err.message });
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
        });
      },

      loadWorkspaces: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
          .from('workspace_members')
          .select(`
            role,
            workspace:workspaces *
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const workspaces = data?.map((m: any) => m.workspace as Workspace) || [];
        set({ workspaces });

        if (workspaces.length > 0 && !get().workspace) {
          await get().selectWorkspace(workspaces[0]);
        }
      },

      selectWorkspace: async (workspace) => {
        set({ workspace });
        await get().loadMembers();
      },

      loadMembers: async () => {
        const { workspace } = get();
        if (!workspace) return;

        const { data, error } = await supabase
          .from('workspace_members')
          .select(`
            *,
            user:users *
          `)
          .eq('workspace_id', workspace.id);

        if (error) throw error;
        set({ members: (data as unknown as WorkspaceMember[]) || [] });
      },

      createDefaultWorkspace: async (userName: string) => {
        const { user } = get();
        if (!user) return;

        const workspaceName = `${userName}'s Workspace`;

        const { data: workspace, error: wsError } = await supabase
          .from('workspaces')
          .insert({ name: workspaceName })
          .select()
          .single();

        if (wsError) throw wsError;

        await supabase.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin',
        });

        const etapas = [
          { name: 'Base', position: 0, is_default: true },
          { name: 'Lead Mapeado', position: 1, is_default: false },
          { name: 'Tentando Contato', position: 2, is_default: false },
          { name: 'Conexão Iniciada', position: 3, is_default: false },
          { name: 'Desqualificado', position: 4, is_default: false },
          { name: 'Qualificado', position: 5, is_default: false },
          { name: 'Reunião Agendada', position: 6, is_default: false },
        ];

        await supabase.from('funil_etapas').insert(
          etapas.map(e => ({ ...e, workspace_id: workspace.id }))
        );

        await get().loadWorkspaces();
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
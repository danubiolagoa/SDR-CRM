import { create } from 'zustand';
import { supabase } from '../lib/neon';
import { useAuthStore } from './authStore';
import type { Lead, FunilEtapa, CustomField, LeadMessage, Campaign } from '../types';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
}

interface LeadsState {
  leads: Lead[];
  etapas: FunilEtapa[];
  customFields: CustomField[];
  campaigns: Campaign[];
  currentLead: Lead | null;
  currentMessages: LeadMessage | null;
  isLoading: boolean;
  error: string | null;

  // Lead actions
  loadLeads: () => Promise<void>;
  loadLead: (id: string) => Promise<void>;
  createLead: (lead: Partial<Lead>) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  moveLead: (id: string, newEtapaId: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Etapa actions
  loadEtapas: () => Promise<void>;

  // Custom fields actions
  loadCustomFields: () => Promise<void>;
  createCustomField: (field: Partial<CustomField>) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;

  // Campaign actions
  loadCampaigns: () => Promise<void>;
  createCampaign: (campaign: Partial<Campaign>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Message actions
  loadMessages: (leadId: string) => Promise<void>;
  generateMessages: (leadId: string, campaignId: string) => Promise<LeadMessage>;
  sendMessage: (messageId: string, messageText: string) => Promise<void>;

  clearError: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  etapas: [],
  customFields: [],
  campaigns: [],
  currentLead: null,
  currentMessages: null,
  isLoading: false,
  error: null,

  loadLeads: async () => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ leads: data || [] });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Erro ao carregar leads') });
    } finally {
      set({ isLoading: false });
    }
  },

  loadLead: async (id) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentLead: data });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Erro ao carregar lead') });
    } finally {
      set({ isLoading: false });
    }
  },

  createLead: async (leadData) => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) throw new Error('No workspace selected');

    const { defaultEtapa } = await get().loadEtapas().then(() => {
      const etapas = get().etapas;
      return { defaultEtapa: etapas.find(e => e.is_default) || etapas[0] };
    });

    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        workspace_id: workspace.id,
        current_etapa_id: defaultEtapa?.id,
      })
      .select()
      .single();

    if (error) throw error;
    await get().loadLeads();
    return data;
  },

  updateLead: async (id, data) => {
    const { error } = await supabase
      .from('leads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await get().loadLeads();
  },

  moveLead: async (id, newEtapaId) => {
    const { data: lead } = await supabase
      .from('leads')
      .select('current_etapa_id')
      .eq('id', id)
      .single();

    if (lead?.current_etapa_id === newEtapaId) return;

    // Verificar campos obrigatórios da nova etapa
    const { data: requiredFields } = await supabase
      .from('funil_campos_obrigatorios')
      .select('field_name')
      .eq('etapa_id', newEtapaId);

    if (requiredFields && requiredFields.length > 0) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      const missing: string[] = [];
      for (const rf of requiredFields) {
        const fieldName = rf.field_name;
        if (!leadData[fieldName] || leadData[fieldName] === '') {
          missing.push(fieldName);
        }
      }

      if (missing.length > 0) {
        throw new Error(`Campos obrigatórios não preenchidos: ${missing.join(', ')}`);
      }
    }

    const { error } = await supabase
      .from('leads')
      .update({
        current_etapa_id: newEtapaId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await get().loadLeads();
  },

  deleteLead: async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    await get().loadLeads();
  },

  loadEtapas: async () => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    const { data, error } = await supabase
      .from('funil_etapas')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('position');

    if (error) throw error;
    set({ etapas: data || [] });
  },

  loadCustomFields: async () => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('position');

    if (error) throw error;
    set({ customFields: data || [] });
  },

  createCustomField: async (field) => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    const { error } = await supabase.from('custom_fields').insert({
      ...field,
      workspace_id: workspace.id,
    });

    if (error) throw error;
    await get().loadCustomFields();
  },

  deleteCustomField: async (id) => {
    const { error } = await supabase.from('custom_fields').delete().eq('id', id);
    if (error) throw error;
    await get().loadCustomFields();
  },

  loadCampaigns: async () => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ campaigns: data || [] });
  },

  createCampaign: async (campaign) => {
    const { workspace } = useAuthStore.getState();
    if (!workspace) return;

    const { error } = await supabase.from('campaigns').insert({
      ...campaign,
      workspace_id: workspace.id,
    });

    if (error) throw error;
    await get().loadCampaigns();
  },

  updateCampaign: async (id, data) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await get().loadCampaigns();
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
    await get().loadCampaigns();
  },

  loadMessages: async (leadId) => {
    const { data, error } = await supabase
      .from('lead_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ currentMessages: data?.[0] || null });
  },

  generateMessages: async (leadId, campaignId) => {
    set({ isLoading: true });

    try {
      // Buscar dados do lead e campanha
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      const { data: campaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!lead || !campaign) throw new Error('Lead ou campanha não encontrada');

      // Chamar OpenRouter API diretamente para gerar mensagens
      const prompt = buildPrompt(lead, campaign);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sdr-crm.app',
          'X-Title': 'SDR CRM Message Generator',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku-20240307',
          messages: [
            {
              role: 'system',
              content: 'You are an expert sales copywriter for B2B outbound. You write personalized, engaging cold messages that feel human-written. You understand Brazilian Portuguese business context.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!response.ok) throw new Error('Erro ao gerar mensagens com IA');

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || '';
      const messages = parseGeneratedMessages(generatedText);

      // Salvar mensagens no banco
      const { data: leadMessage, error } = await supabase
        .from('lead_messages')
        .insert({
          lead_id: leadId,
          campaign_id: campaignId,
          messages,
          status: 'generated',
        })
        .select()
        .single();

      if (error) throw error;
      set({ currentMessages: leadMessage });
      return leadMessage;
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (messageId, messageText) => {
    const { currentMessages } = get();
    if (!currentMessages) return;

    // Registrar no histórico
    await supabase.from('message_history').insert({
      lead_id: currentMessages.lead_id,
      campaign_id: currentMessages.campaign_id,
      message_content: messageText,
    });

    // Atualizar status da mensagem
    await supabase
      .from('lead_messages')
      .update({ status: 'sent' })
      .eq('id', messageId);

    // Mover lead para "Tentando Contato" se não estiver lá
    const { workspace } = useAuthStore.getState();
    if (workspace) {
      const { data: tentandoContato } = await supabase
        .from('funil_etapas')
        .select('id')
        .eq('workspace_id', workspace.id)
        .ilike('name', '%Tentando Contato%')
        .single();

      if (tentandoContato) {
        await supabase
          .from('leads')
          .update({ current_etapa_id: tentandoContato.id })
          .eq('id', currentMessages.lead_id);
      }
    }

    await get().loadLeads();
  },

  clearError: () => set({ error: null }),
}));

// Helper functions para geração de mensagens
function buildPrompt(lead: Lead, campaign: Campaign): string {
  const context = campaign.context
    .replace(/\{\{name\}\}/g, lead.name || '')
    .replace(/\{\{company\}\}/g, lead.company || '')
    .replace(/\{\{job_title\}\}/g, lead.job_title || '')
    .replace(/\{\{email\}\}/g, lead.email || '');

  return `${campaign.prompt_instructions}

Contexto da Campanha:
${context}

Dados do Lead:
- Nome: ${lead.name}
- Empresa: ${lead.company || 'N/A'}
- Cargo: ${lead.job_title || 'N/A'}
- Email: ${lead.email || 'N/A'}
- Telefone: ${lead.phone || 'N/A'}
- Origem: ${lead.source || 'N/A'}

Gere exatamente 3 mensagens diferentes, cada uma com no máximo 150 caracteres. Separe cada mensagem com "---" na linha单独. Não inclua numeração ou títulos.`;
}

function parseGeneratedMessages(text: string): { id: string; text: string }[] {
  const parts = text.split('---').map(s => s.trim()).filter(s => s.length > 0);

  if (parts.length === 0) {
    return [{ id: crypto.randomUUID(), text: text.trim() }];
  }

  return parts.slice(0, 3).map(part => ({
    id: crypto.randomUUID(),
    text: part.replace(/^\d+[).]\s*/, '').trim(),
  }));
}

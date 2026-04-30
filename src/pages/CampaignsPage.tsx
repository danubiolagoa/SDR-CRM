import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Plus, RotateCcw, Send, Target, X, Zap } from 'lucide-react';
import { useLeadsStore } from '../stores/leadsStore';
import { useAuthStore } from '../stores/authStore';
import type { Campaign } from '../types';
import type { FunilEtapa } from '../types';
import { HashtagInput } from '../components/ui/HashtagInput';
import { OPENROUTER_MODEL, hasOpenRouterApiKey } from '../lib/openRouter';

export function CampaignsPage() {
  const { workspace } = useAuthStore();
  const { campaigns, etapas, leads, loadCampaigns, loadEtapas, loadLeads, createCampaign, deleteCampaign, generateMessages, currentMessages, isLoading, error } = useLeadsStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [generatingForLead, setGeneratingForLead] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const hasOpenRouterKey = hasOpenRouterApiKey();

  useEffect(() => {
    if (workspace) {
      loadCampaigns();
      loadEtapas();
      loadLeads();
    }
  }, [workspace, loadCampaigns, loadEtapas, loadLeads]);

  const handleGenerate = async (leadId: string, campaignId: string) => {
    if (!hasOpenRouterKey) {
      setGenerateError('API key do OpenRouter não configurada');
      return;
    }
    setGenerateError(null);
    setGeneratingForLead(leadId);
    try {
      await generateMessages(leadId, campaignId);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Erro ao gerar mensagens');
    } finally {
      setGeneratingForLead(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Progress indicator
  const isGenerating = !!generatingForLead;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-500 mt-1">Gerencie campanhas de abordagem</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nova Campanha
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {generateError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          ⚠️ {generateError}
        </div>
      )}

      {!hasOpenRouterKey && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
          ⚠️ A API key do OpenRouter não está configurada neste build. No local, use <code className="bg-amber-100 px-1 rounded">.env.local</code>. No Vercel, configure <code className="bg-amber-100 px-1 rounded">VITE_OPENROUTER_API_KEY</code> como environment variable e faça redeploy. Modelo esperado: <code className="bg-amber-100 px-1 rounded">{OPENROUTER_MODEL}</code>
        </div>
      )}

      {/* Campaign Cards Grid */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              whileHover={{ y: -2 }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setEditingCampaign(campaign)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{campaign.description || 'Sem descrição'}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {campaign.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {campaign.trigger_etapa && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Zap size={14} className="text-amber-500" />
                  <span>Gatilho: {campaign.trigger_etapa.name}</span>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingCampaign(campaign); }}
                  className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id); }}
                  className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="text-gray-400" size={40} />
          </div>
          <p className="text-gray-600 text-lg font-medium">Nenhuma campanha criada</p>
          <p className="text-gray-400 mt-1">Comece criando sua primeira campanha de abordagem</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Criar Campanha
          </button>
        </div>
      )}

      {/* Generate Messages Section */}
      {campaigns.length > 0 && leads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Zap className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gerar Mensagens</h2>
              <p className="text-sm text-gray-500">Selecione um lead e uma campanha para gerar mensagens com IA</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione um lead...</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.company || 'Sem empresa'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Campanha</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione uma campanha...</option>
                {campaigns.filter(c => c.is_active).map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {isGenerating ? (
                <div className="h-11 px-5 flex items-center gap-3 bg-indigo-600 text-white rounded-lg">
                  <div className="w-24 h-2 bg-indigo-400 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">Gerando...</span>
                </div>
              ) : (
                <button
                  onClick={() => selectedLeadId && selectedCampaignId && handleGenerate(selectedLeadId, selectedCampaignId)}
                  disabled={!selectedLeadId || !selectedCampaignId || !hasOpenRouterKey}
                  className="h-11 px-5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Zap size={18} />
                  Gerar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Display */}
      <AnimatePresence>
        {currentMessages && currentMessages.messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Send className="text-emerald-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Mensagens Geradas</h2>
              </div>
              <button
                onClick={() => selectedCampaignId && selectedCampaignId && handleGenerate(selectedLeadId, selectedCampaignId)}
                disabled={!selectedLeadId || !selectedCampaignId || !!generatingForLead || !hasOpenRouterKey}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={14} />
                Regenerar
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-100 space-y-4">
                {currentMessages.messages.map((msg, i) => (
                  <div key={msg.id || i} className="flex gap-2 leading-relaxed">
                    <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(currentMessages.messages.map((m, i) => `${i + 1}. ${m.text}`).join('\n\n'))}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={14} />
                  Copiar Todas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Campaign Modal */}
      <CampaignModal
        etapas={etapas}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createCampaign(data);
          setIsCreateModalOpen(false);
        }}
      />

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <CampaignModal
          campaign={editingCampaign}
          etapas={etapas}
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSubmit={async (data) => {
            await useLeadsStore.getState().updateCampaign(editingCampaign.id, data);
            setEditingCampaign(null);
          }}
        />
      )}
    </div>
  );
}

interface CampaignModalProps {
  etapas: FunilEtapa[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
  campaign?: Campaign;
}

function CampaignModal({ etapas, isOpen, onClose, onSubmit, campaign }: CampaignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    context: campaign?.context || '',
    prompt_instructions: campaign?.prompt_instructions || '',
    trigger_etapa_id: campaign?.trigger_etapa_id || '',
    is_active: campaign?.is_active ?? true,
  });

  // Sync formData quando campaign mudar (para edição)
  const prevCampaignId = useRef<string | undefined>(campaign?.id);

  useEffect(() => {
    if (campaign?.id !== prevCampaignId.current) {
      prevCampaignId.current = campaign?.id;
      setFormData({
        name: campaign?.name || '',
        description: campaign?.description || '',
        context: campaign?.context || '',
        prompt_instructions: campaign?.prompt_instructions || '',
        trigger_etapa_id: campaign?.trigger_etapa_id || '',
        is_active: campaign?.is_active ?? true,
      });
    }
  }, [campaign]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        trigger_etapa_id: formData.trigger_etapa_id || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="Ex: Black Friday 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Breve descrição da campanha"
            />
          </div>

          <HashtagInput
            value={formData.context}
            onChange={(value) => setFormData({ ...formData, context: value })}
            label="Contexto (Informações para IA) *"
            placeholder="Descreva a oferta, produto, condições... Use uma #tag para o valor do lead"
            rows={4}
            hint="Use apenas uma tag: #nome, #empresa, #cargo, #email, #telefone ou #origem"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt de Geração *</label>
            <textarea
              value={formData.prompt_instructions}
              onChange={(e) => setFormData({ ...formData, prompt_instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              required
              placeholder="Ex: Escreva em tom informal mas profissional. Mencione que viu o perfil no LinkedIn. Inclua uma proposta de valor clara."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa Gatilho (opcional)</label>
            <select
              value={formData.trigger_etapa_id}
              onChange={(e) => setFormData({ ...formData, trigger_etapa_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Nenhum gatilho</option>
              {etapas.map(etapa => (
                <option key={etapa.id} value={etapa.id}>{etapa.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Quando um lead entrar nesta etapa, mensagens serão geradas automaticamente</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Campanha Ativa</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : campaign ? 'Salvar' : 'Criar Campanha'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

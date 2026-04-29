import { useEffect, useState } from 'react';
import { Plus, X, Loader2, Zap, Copy, Send, RotateCcw } from 'lucide-react';
import { useLeadsStore } from '../stores/leadsStore';
import { useAuthStore } from '../stores/authStore';
import type { Campaign } from '../types';

export function CampaignsPage() {
  const { workspace } = useAuthStore();
  const { campaigns, etapas, leads, loadCampaigns, loadEtapas, loadLeads, createCampaign, deleteCampaign, generateMessages, currentMessages, sendMessage, isLoading, error } = useLeadsStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [generatingForLead, setGeneratingForLead] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      loadCampaigns();
      loadEtapas();
      loadLeads();
    }
  }, [workspace]);

  const handleGenerate = async (leadId: string, campaignId: string) => {
    setGeneratingForLead(leadId);
    try {
      await generateMessages(leadId, campaignId);
    } finally {
      setGeneratingForLead(null);
    }
  };

  const handleSend = async (messageText: string) => {
    if (!currentMessages) return;
    await sendMessage(currentMessages.id, messageText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-500 mt-1">Gerencie campanhas de abordagem</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{campaign.description || 'Sem descrição'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${campaign.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {campaign.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            {campaign.trigger_etapa && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Zap size={14} />
                Gatilho: {campaign.trigger_etapa.name}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedCampaign(campaign)}
                className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Editar
              </button>
              <button
                onClick={() => deleteCampaign(campaign.id)}
                className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Zap className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-4">Nenhuma campanha criada</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-indigo-600 text-sm mt-2"
          >
            Criar primeira campanha
          </button>
        </div>
      )}

      {/* Generate Messages Section */}
      {campaigns.length > 0 && leads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerar Mensagens</h2>
          <div className="flex gap-4">
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecione um lead...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.company || 'Sem empresa'}
                </option>
              ))}
            </select>
            <select
              value={selectedCampaign?.id || ''}
              onChange={(e) => setSelectedCampaign(campaigns.find(c => c.id === e.target.value) || null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecione uma campanha...</option>
              {campaigns.filter(c => c.is_active).map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedLeadId && selectedCampaign && handleGenerate(selectedLeadId, selectedCampaign.id)}
              disabled={!selectedLeadId || !selectedCampaign || !!generatingForLead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generatingForLead ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              Gerar
            </button>
          </div>
        </div>
      )}

      {/* Messages Display */}
      {currentMessages && currentMessages.messages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mensagens Geradas</h2>
            <button
              onClick={() => selectedCampaign && selectedLeadId && handleGenerate(selectedLeadId, selectedCampaign.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
            >
              <RotateCcw size={16} />
              Regenerar
            </button>
          </div>

          <div className="space-y-4">
            {currentMessages.messages.map((msg, index) => (
              <div key={msg.id || index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{msg.text}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Copy size={14} />
                    Copiar
                  </button>
                  <button
                    onClick={() => handleSend(msg.text)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Send size={14} />
                    Enviar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <CreateCampaignModal
          etapas={etapas}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            await createCampaign(data);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface CreateCampaignModalProps {
  etapas: any[];
  onClose: () => void;
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
}

function CreateCampaignModal({ etapas, onClose, onSubmit }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    context: '',
    prompt_instructions: '',
    trigger_etapa_id: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <h2 className="text-lg font-semibold text-gray-900">Nova Campanha</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Ex: Black Friday 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Breve descrição da campanha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contexto (Informações para IA) *
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Descreva a oferta, produto, condições, período..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt de Geração *
            </label>
            <textarea
              value={formData.prompt_instructions}
              onChange={(e) => setFormData({ ...formData, prompt_instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Persona, tom de voz, tamanho, campos do lead: {{name}}, {{company}}, {{job_title}}..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa Gatilho (opcional)</label>
            <select
              value={formData.trigger_etapa_id}
              onChange={(e) => setFormData({ ...formData, trigger_etapa_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Nenhum gatilho</option>
              {etapas.map(etapa => (
                <option key={etapa.id} value={etapa.id}>
                  {etapa.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Quando um lead entrar nesta etapa, mensagens serão geradas automaticamente</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Campanha Ativa</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Criar Campanha'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
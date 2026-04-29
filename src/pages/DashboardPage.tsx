import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLeadsStore } from '../stores/leadsStore';

export function DashboardPage() {
  const { workspace } = useAuthStore();
  const { leads, etapas, campaigns, loadLeads, loadEtapas, loadCampaigns, isLoading } = useLeadsStore();

  useEffect(() => {
    if (workspace) {
      loadLeads();
      loadEtapas();
      loadCampaigns();
    }
  }, [loadCampaigns, loadEtapas, loadLeads, workspace]);

  const leadsPorEtapa = etapas.map(etapa => ({
    ...etapa,
    count: leads.filter(l => l.current_etapa_id === etapa.id).length,
  }));

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l =>
    l.current_etapa_id === etapas.find(e => e.name.includes('Qualificado'))?.id
  ).length;
  const activeCampaigns = campaigns.filter(c => c.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do workspace {workspace?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Qualificados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{qualifiedLeads}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Campanhas Ativas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Target className="text-violet-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Etapas do Funil</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{etapas.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leads por Etapa</h2>
          <Link to="/leads" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver Kanban <ArrowRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {leadsPorEtapa.map((etapa) => {
            const percentage = totalLeads > 0 ? (etapa.count / totalLeads) * 100 : 0;
            return (
              <div key={etapa.id} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700 truncate">{etapa.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-gray-500 text-right">{etapa.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leads Recentes</h2>
          <Link to="/leads" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-2">Nenhum lead cadastrado</p>
            <Link to="/leads" className="text-indigo-600 text-sm mt-2 inline-block">
              Criar primeiro lead
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.company || 'Sem empresa'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {lead.etapa?.name || 'Sem etapa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

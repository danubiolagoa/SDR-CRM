import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Target, Layers, ArrowRight, Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLeadsStore } from '../stores/leadsStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getEtapaColorHex } from '../lib/etapaColors';

const ETAPA_COLORS: Record<string, string> = {
  'Base': '#64748b',
  'Lead Mapeado': '#3b82f6',
  'Tentando Contato': '#f59e0b',
  'Conexão Iniciada': '#8b5cf6',
  'Desqualificado': '#ef4444',
  'Qualificado': '#10b981',
  'Reunião Agendada': '#06b6d4',
};

function getEtapaColor(etapaName: string, color?: string, index?: number): string {
  if (color) {
    return getEtapaColorHex(color, index);
  }
  // Fallback para cor por nome
  if (ETAPA_COLORS[etapaName]) {
    return ETAPA_COLORS[etapaName];
  }
  // Fallback por índice
  const colors = Object.values(ETAPA_COLORS);
  return colors[index !== undefined ? index % colors.length : 0];
}

export function DashboardPage() {
  const { workspace } = useAuthStore();
  const { leads, etapas, campaigns, loadLeads, loadEtapas, loadCampaigns, isLoading } = useLeadsStore();

  useEffect(() => {
    if (workspace) {
      loadLeads();
      loadEtapas();
      loadCampaigns();
    }
  }, [workspace, loadLeads, loadEtapas, loadCampaigns]);

  const leadsPorEtapa = etapas.map(etapa => ({
    ...etapa,
    count: leads.filter(l => l.current_etapa_id === etapa.id).length,
  }));

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l =>
    l.current_etapa_id === etapas.find(e => e.name.includes('Qualificado'))?.id
  ).length;
  const activeCampaigns = campaigns.filter(c => c.is_active).length;

  const qualifiedRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  // Data for funnel chart
  const funnelData = leadsPorEtapa.map((etapa, index) => ({
    name: shortenName(etapa.name),
    fullName: etapa.name,
    value: etapa.count,
    fill: getEtapaColor(etapa.name, etapa.color, index),
  }));

  // Helper function to shorten names for chart display
  function shortenName(name: string): string {
    const maxLen = 14;
    if (name.length <= maxLen) return name;
    return name.substring(0, maxLen - 1) + '…';
  }

  // Data for pie chart - usar cores alinhadas com o funnel
  const pieData = leadsPorEtapa.filter(e => e.count > 0).map((etapa, index) => ({
    name: shortenName(etapa.name),
    fullName: etapa.name,
    value: etapa.count,
    fill: getEtapaColor(etapa.name, etapa.color, index),
  }));

  // Simulated conversion data for line chart
  const conversionData = [
    { name: 'Sem 1', leads: Math.floor(totalLeads * 0.4), qualified: Math.floor(qualifiedLeads * 0.3) },
    { name: 'Sem 2', leads: Math.floor(totalLeads * 0.5), qualified: Math.floor(qualifiedLeads * 0.5) },
    { name: 'Sem 3', leads: Math.floor(totalLeads * 0.6), qualified: Math.floor(qualifiedLeads * 0.7) },
    { name: 'Sem 4', leads: totalLeads, qualified: qualifiedLeads },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do workspace</p>
        </div>
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Lead
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total de Leads</p>
              <p className="text-3xl font-bold mt-1">{totalLeads}</p>
              <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +12% vs mês passado
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Taxa de Qualificação</p>
              <p className="text-3xl font-bold mt-1">{qualifiedRate}%</p>
              <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {qualifiedLeads} leads
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-100 text-sm">Campanhas Ativas</p>
              <p className="text-3xl font-bold mt-1">{activeCampaigns}</p>
              <p className="text-violet-200 text-xs mt-1">Total: {campaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Target size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-100 text-sm">Etapas do Funil</p>
              <p className="text-3xl font-bold mt-1">{etapas.length}</p>
              <p className="text-amber-200 text-xs mt-1">Em uso</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Layers size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Distribuição por Etapa</h2>
            <Link
              to="/leads"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
            >
              Ver Kanban <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Proporção por Etapa</h2>
          </div>

          {isLoading ? (
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    labelFormatter={(label) => pieData.find(d => d.name === label)?.fullName || label}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-sm text-gray-600 flex-1 truncate whitespace-nowrap" title={item.fullName}>{item.fullName}</span>
                    <span className="text-sm font-medium text-gray-900 flex-shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Line Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Evolução de Leads</h2>
          <span className="text-sm text-gray-500">Últimas 4 semanas</span>
        </div>

        {isLoading ? (
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={conversionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Total Leads" />
              <Line type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Qualificados" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Leads Recentes</h2>
          <Link
            to="/leads"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500">Nenhum lead cadastrado</p>
            <Link
              to="/leads"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block"
            >
              Criar primeiro lead
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm text-indigo-600 font-medium">
                      {lead.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.company || 'Sem empresa'}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {lead.etapa?.name || 'Sem etapa'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Layers, Grid3X3, Plus, X, Building2, Trash2, GripVertical, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLeadsStore } from '../stores/leadsStore';
import { DEFAULT_ETAPA_COLORS, ETAPA_COLORS_HEX, getEtapaColorHex, getEtapaColorKey } from '../lib/etapaColors';
import type { CustomField, FunilEtapa, Workspace, WorkspaceMember } from '../types';

type Tab = 'geral' | 'membros' | 'funil' | 'campos';

const tabs = [
  { id: 'geral' as const, label: 'Geral', icon: Settings },
  { id: 'membros' as const, label: 'Membros', icon: Users },
  { id: 'funil' as const, label: 'Funil', icon: Layers },
  { id: 'campos' as const, label: 'Campos', icon: Grid3X3 },
];

export function SettingsPage() {
  const { workspace, members, loadMembers } = useAuthStore();
  const { etapas, customFields, loadEtapas, loadCustomFields } = useLeadsStore();
  const [activeTab, setActiveTab] = useState<Tab>('geral');

  useEffect(() => {
    if (workspace) {
      loadEtapas();
      loadCustomFields();
      loadMembers();
    }
  }, [workspace, loadEtapas, loadCustomFields, loadMembers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie {workspace?.name}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'geral' && <GeralTab workspace={workspace} />}
        {activeTab === 'membros' && <MembrosTab members={members} />}
        {activeTab === 'funil' && <FunilTab etapas={etapas} />}
        {activeTab === 'campos' && <CamposTab customFields={customFields} />}
      </motion.div>
    </motion.div>
  );
}

function GeralTab({ workspace }: { workspace: Workspace | null }) {
  const [name, setName] = useState(workspace?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { updateWorkspace } = useAuthStore();

  const handleSave = async () => {
    if (!workspace) return;
    setIsSaving(true);
    try {
      await updateWorkspace(workspace.id, name);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Building2 className="text-indigo-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Informações Gerais</h2>
          <p className="text-sm text-gray-500">Nome e configurações do workspace</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Workspace</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do workspace"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}

function MembrosTab({ members }: { members: WorkspaceMember[] }) {
  const { addMember, removeMember } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsAdding(true);
    setError('');
    try {
      await addMember(email.trim(), role);
      setEmail('');
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Deseja remover este membro do workspace?')) {
      await removeMember(memberId);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users className="text-violet-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Membros do Workspace</h2>
            <p className="text-sm text-gray-500">{members.length} membros</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Adicionar Membro
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto text-gray-400" size={32} />
          <p className="text-gray-600 mt-2">Nenhum membro ainda</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="py-4 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm text-indigo-600 font-medium">
                    {member.user?.name?.charAt(0).toUpperCase() || member.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user?.name || 'Sem nome'}</p>
                  <p className="text-sm text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`
                  text-xs px-3 py-1 rounded-full font-medium
                  ${member.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </span>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Adicionar Membro</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email do usuário</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@email.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Função</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isAdding ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FunilTab({ etapas }: { etapas: FunilEtapa[] }) {
  const { createEtapa, updateEtapa, deleteEtapa, reorderEtapas } = useLeadsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<FunilEtapa | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (name: string, isDefault: boolean, color: string) => {
    setIsSaving(true);
    try {
      if (editingEtapa) {
        await updateEtapa(editingEtapa.id, { name, is_default: isDefault, color });
      } else {
        await createEtapa({ name, position: etapas.length, is_default: isDefault, color });
      }
      setIsModalOpen(false);
      setEditingEtapa(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar etapa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta etapa? Os leads nela serão movidos para a etapa padrão.')) {
      await deleteEtapa(id);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...etapas];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    await reorderEtapas(reordered.map((e, i) => ({ ...e, position: i })));
  };

  const handleMoveDown = async (index: number) => {
    if (index === etapas.length - 1) return;
    const reordered = [...etapas];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    await reorderEtapas(reordered.map((e, i) => ({ ...e, position: i })));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Layers className="text-amber-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Etapas do Funil</h2>
            <p className="text-sm text-gray-500">{etapas.length} etapas configuradas</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingEtapa(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Nova Etapa
        </button>
      </div>

      {etapas.length === 0 ? (
        <div className="text-center py-8">
          <Layers className="mx-auto text-gray-400" size={32} />
          <p className="text-gray-600 mt-2">Nenhuma etapa criada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {etapas.map((etapa, index) => (
            <div
              key={etapa.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={18} />
              </div>
              <span className="text-sm text-gray-400 w-6">{index + 1}</span>
              <div
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: getEtapaColorHex(etapa.color, etapa.position) }}
              />
              <span className="font-medium text-gray-900 flex-1">{etapa.name}</span>
              {etapa.is_default && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Padrão</span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Mover para cima"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === etapas.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  onClick={() => { setEditingEtapa(etapa); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600"
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(etapa.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <EtapaModal
          etapa={editingEtapa}
          onClose={() => { setIsModalOpen(false); setEditingEtapa(null); }}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

interface EtapaModalProps {
  etapa: FunilEtapa | null;
  onClose: () => void;
  onSave: (name: string, isDefault: boolean, color: string) => Promise<void>;
  isSaving: boolean;
}

function EtapaModal({ etapa, onClose, onSave, isSaving }: EtapaModalProps) {
  const [name, setName] = useState(etapa?.name || '');
  const [isDefault, setIsDefault] = useState(etapa?.is_default || false);
  const [selectedColor, setSelectedColor] = useState(getEtapaColorKey(etapa?.color, etapa?.position));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim(), isDefault, selectedColor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {etapa ? 'Editar Etapa' : 'Nova Etapa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Etapa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Qualificado"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Etapa</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_ETAPA_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-indigo-500 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: ETAPA_COLORS_HEX[color] }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">Etapa padrão para novos leads</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CamposTab({ customFields }: { customFields: CustomField[] }) {
  const { createCustomField, deleteCustomField } = useLeadsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Grid3X3 className="text-emerald-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Campos Personalizados</h2>
            <p className="text-sm text-gray-500">Defina campos extras para os leads</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Novo Campo
        </button>
      </div>

      {customFields.length === 0 ? (
        <div className="text-center py-8">
          <Grid3X3 className="mx-auto text-gray-400" size={32} />
          <p className="text-gray-600 mt-2">Nenhum campo personalizado criado</p>
          <button
            className="mt-3 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Criar primeiro campo
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {customFields.map((field) => (
            <div key={field.id} className="py-4 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors">
              <div>
                <p className="font-medium text-gray-900">{field.name}</p>
                <p className="text-sm text-gray-500 capitalize">Tipo: {field.field_type}</p>
              </div>
              <button
                onClick={() => deleteCustomField(field.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateFieldModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            await createCustomField(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface CreateFieldModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<CustomField>) => Promise<void>;
}

function CreateFieldModal({ onClose, onSubmit }: CreateFieldModalProps) {
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'select'>('text');
  const [options, setOptions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        field_type: fieldType,
        options: fieldType === 'select' ? options.split(',').map(o => o.trim()) : [],
        position: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Novo Campo Personalizado</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Campo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Segmento"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomField['field_type'])}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="select">Select (escolha)</option>
            </select>
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Opções (separadas por vírgula)</label>
              <input
                type="text"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Ex: PMEs, Grandes Empresas, Startups"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Criando...' : 'Criar Campo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

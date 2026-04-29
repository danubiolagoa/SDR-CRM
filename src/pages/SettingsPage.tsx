import { useEffect, useState } from 'react';
import { Settings, Users, Plus, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLeadsStore } from '../stores/leadsStore';
import type { CustomField, FunilEtapa, Workspace, WorkspaceMember } from '../types';

type Tab = 'geral' | 'membros' | 'funil' | 'campos';

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
  }, [loadCustomFields, loadEtapas, loadMembers, workspace]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie workspace {workspace?.name}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'geral', label: 'Geral', icon: Settings },
            { id: 'membros', label: 'Membros', icon: Users },
            { id: 'funil', label: 'Funil', icon: Settings },
            { id: 'campos', label: 'Campos Personalizados', icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'geral' && <GeralTab workspace={workspace} />}
      {activeTab === 'membros' && <MembrosTab members={members} />}
      {activeTab === 'funil' && <FunilTab etapas={etapas} />}
      {activeTab === 'campos' && <CamposTab customFields={customFields} />}
    </div>
  );
}

function GeralTab({ workspace }: { workspace: Workspace | null }) {
  const [name, setName] = useState(workspace?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Implementar update do workspace
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Workspace</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Salvar'}
      </button>
    </div>
  );
}

function MembrosTab({ members }: { members: WorkspaceMember[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Membros do Workspace</h2>
      {members.length === 0 ? (
        <p className="text-gray-500">Nenhum membro ainda</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm text-indigo-600 font-medium">
                    {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user?.name || 'Sem nome'}</p>
                  <p className="text-sm text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                member.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {member.role === 'admin' ? 'Admin' : 'Membro'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FunilTab({ etapas }: { etapas: FunilEtapa[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Etapas do Funil</h2>
      <p className="text-sm text-gray-500 mb-4">As etapas são compartilhadas por todos os leads do workspace</p>

      <div className="space-y-2">
        {etapas.map((etapa, index) => (
          <div key={etapa.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500 w-6">{index + 1}</span>
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="font-medium text-gray-900 flex-1">{etapa.name}</span>
            {etapa.is_default && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Padrão</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CamposTab({ customFields }: { customFields: CustomField[] }) {
  const { createCustomField, deleteCustomField } = useLeadsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Campos Personalizados</h2>
          <p className="text-sm text-gray-500">Defina campos extras para os leads</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={16} />
          Novo Campo
        </button>
      </div>

      {customFields.length === 0 ? (
        <p className="text-gray-500 py-4">Nenhum campo personalizado criado</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {customFields.map((field) => (
            <div key={field.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{field.name}</p>
                <p className="text-sm text-gray-500">Tipo: {field.field_type}</p>
              </div>
              <button
                onClick={() => deleteCustomField(field.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
          <h2 className="text-lg font-semibold text-gray-900">Novo Campo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Campo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="Ex: Segmento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomField['field_type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="select">Select (escolha)</option>
            </select>
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opções (separadas por vírgula)</label>
              <input
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: PMEs, Grandes Empresas, Startups"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Criar Campo'}
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

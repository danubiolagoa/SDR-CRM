import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeadsStore } from '../stores/leadsStore';
import { useAuthStore } from '../stores/authStore';
import { getEtapaColorHex } from '../lib/etapaColors';
import type { CustomField } from '../types';

function DroppableColumn({ etapaId, children, isOver }: { etapaId: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: etapaId });
  return (
    <div ref={setNodeRef} className={`h-full transition-colors ${isOver ? 'bg-indigo-50' : ''}`}>
      {children}
    </div>
  );
}

interface LeadCardProps {
  lead: { id: string; name: string; company?: string; etapa?: { name: string; color?: string; position?: number }; responsible?: { name?: string; email?: string } };
  onClick: () => void;
}

function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const etapaDotColor = getEtapaColorHex(lead.etapa?.color, lead.etapa?.position);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      className={`bg-white rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md border border-gray-200 ${isDragging ? 'shadow-lg ring-2 ring-indigo-200 border-indigo-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{lead.name}</p>
          <p className="text-sm text-gray-500 truncate">{lead.company || 'Sem empresa'}</p>
        </div>
        <div className="text-gray-400">
          <GripVertical size={16} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: etapaDotColor }} />
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${etapaDotColor}1f`, color: etapaDotColor }}
          >
            {lead.etapa?.name || 'Sem etapa'}
          </span>
        </div>
        {lead.responsible && (
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-indigo-600 font-medium">
              {lead.responsible.name?.charAt(0) || lead.responsible.email?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface KanbanColumnProps {
  etapa: { id: string; name: string; color?: string; position?: number };
  leads: LeadCardProps['lead'][];
  onLeadClick: (lead: LeadCardProps['lead']) => void;
  isOver?: boolean;
}

function KanbanColumn({ etapa, leads, onLeadClick, isOver }: KanbanColumnProps) {
  const colorDot = getEtapaColorHex(etapa.color, etapa.position);

  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 h-full transition-colors">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorDot }} />
        <h3 className="font-medium text-gray-900 text-sm">{etapa.name}</h3>
        <span className="text-xs text-gray-500 ml-auto bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {leads.length}
        </span>
      </div>
      <DroppableColumn etapaId={etapa.id} isOver={!!isOver}>
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-2 min-h-[100px] rounded-lg transition-colors ${isOver ? 'bg-indigo-100' : ''}`}>
            <AnimatePresence>
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DroppableColumn>
    </div>
  );
}

interface LeadModalProps {
  lead: { id: string; name: string; email?: string; phone?: string; company?: string; job_title?: string; source?: string; observations?: string } | null;
  onClose: () => void;
  customFields?: CustomField[];
}

function LeadModal({ lead, onClose, customFields = [] }: LeadModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(lead ?? { name: '', email: '', phone: '', company: '', job_title: '', source: '', observations: '' });
  const { updateLead, deleteLead, isLoading } = useLeadsStore();

  if (lead && JSON.stringify(formData) === '{}') {
    setFormData(lead);
  }

  const handleSave = async () => {
    if (!lead) return;
    try {
      await updateLead(lead.id, formData);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead(lead.id);
      onClose();
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Lead' : 'Detalhes do Lead'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    value={formData.job_title || ''}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              {customFields.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Campos Personalizados</h3>
                  <div className="space-y-3">
                    {customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                        {field.field_type === 'text' && (
                          <input
                            type="text"
                            value={(formData as Record<string, string>)[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        )}
                        {field.field_type === 'number' && (
                          <input
                            type="number"
                            value={(formData as Record<string, string>)[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        )}
                        {field.field_type === 'date' && (
                          <input
                            type="date"
                            value={(formData as Record<string, string>)[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        )}
                        {field.field_type === 'select' && (
                          <select
                            value={(formData as Record<string, string>)[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="">Selecione...</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome</p>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-medium text-gray-900">{lead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Telefone</p>
                  <p className="font-medium text-gray-900">{lead.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Empresa</p>
                  <p className="font-medium text-gray-900">{lead.company || '-'}</p>
                </div>
              </div>
              {lead.observations && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-gray-600 text-sm mt-1">{lead.observations}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  customFields?: CustomField[];
}

function CreateLeadModal({ isOpen, onClose, customFields = [] }: CreateLeadModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    source: '',
    observations: '',
  });
  const { createLead, isLoading } = useLeadsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(formData);
      setFormData({ name: '', email: '', phone: '', company: '', job_title: '', source: '', observations: '' });
      onClose();
    } catch (err) {
      console.error('Erro ao criar lead:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Novo Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="orgânica">Orgânica</option>
              <option value="indicação">Indicação</option>
              <option value="linkedin">LinkedIn</option>
              <option value="frio">Frio</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          {customFields.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Campos Personalizados</h3>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                    {field.field_type === 'text' && (
                      <input
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}
                    {field.field_type === 'number' && (
                      <input
                        type="number"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}
                    {field.field_type === 'date' && (
                      <input
                        type="date"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}
                    {field.field_type === 'select' && (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Lead'}
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

export function LeadsPage() {
  const { workspace } = useAuthStore();
  const { leads, etapas, customFields, loadLeads, loadEtapas, loadCustomFields, moveLead, error } = useLeadsStore();
  const [selectedLead, setSelectedLead] = useState<LeadCardProps['lead'] | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (workspace) {
      loadLeads();
      loadEtapas();
      loadCustomFields();
    }
  }, [workspace, loadLeads, loadEtapas, loadCustomFields]);

  const leadsPorEtapa = etapas.map(etapa => ({
    etapa,
    leads: leads.filter(l => l.current_etapa_id === etapa.id) as LeadCardProps['lead'][],
  }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const leadId = active.id as string;
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Verificar se soltou sobre outro lead
    const overLead = leads.find(l => l.id === over.id);
    if (overLead) {
      const targetEtapaId = overLead.current_etapa_id;
      if (targetEtapaId && targetEtapaId !== lead.current_etapa_id) {
        try {
          await moveLead(leadId, targetEtapaId);
          await loadLeads();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Erro ao mover lead');
        }
        return;
      }
    }

    // Verificar se soltou sobre uma coluna (etapa)
    const targetEtapa = etapas.find(e => e.id === over.id);
    if (targetEtapa && targetEtapa.id !== lead.current_etapa_id) {
      try {
        await moveLead(leadId, targetEtapa.id);
        await loadLeads();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao mover lead');
      }
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Arraste os cards para mover entre etapas</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Novo Lead
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragOver={(e) => setOverId(e.over?.id as string || null)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {leadsPorEtapa.map(({ etapa, leads: etapaLeads }) => (
            <KanbanColumn
              key={etapa.id}
              etapa={etapa}
              leads={etapaLeads}
              onLeadClick={setSelectedLead}
              isOver={overId === etapa.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="bg-white border-2 border-indigo-500 rounded-lg p-4 shadow-xl w-64">
              <p className="font-medium text-gray-900">{activeLead.name}</p>
              <p className="text-sm text-gray-500">{activeLead.company || 'Sem empresa'}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} customFields={customFields} />
      <CreateLeadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} customFields={customFields} />
    </div>
  );
}

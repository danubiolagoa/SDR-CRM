// Tipos do projeto SDR CRM

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  user?: User;
}

export interface FunilEtapa {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
  is_default: boolean;
  color?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  responsible_id: string | null;
  current_etapa_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  source: string;
  observations: string;
  created_at: string;
  updated_at: string;
  responsible?: User;
  etapa?: FunilEtapa;
  custom_fields?: LeadFieldValue[];
}

export interface CustomField {
  id: string;
  workspace_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'select';
  options: string[];
  position: number;
  created_at: string;
}

export interface LeadFieldValue {
  id: string;
  lead_id: string;
  custom_field_id: string;
  value: string;
  custom_field?: CustomField;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  context: string;
  prompt_instructions: string;
  trigger_etapa_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trigger_etapa?: FunilEtapa;
}

export interface LeadMessage {
  id: string;
  lead_id: string;
  campaign_id: string;
  messages: GeneratedMessage[];
  status: 'pending' | 'generated' | 'sent';
  created_at: string;
}

export interface GeneratedMessage {
  id: string;
  text: string;
}

export interface MessageHistory {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  message_content: string;
  sent_at: string;
}

export interface FunilCampoObrigatorio {
  id: string;
  etapa_id: string;
  field_name: string;
  created_at: string;
}
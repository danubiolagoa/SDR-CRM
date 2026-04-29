-- SDR CRM - Schema SQL para Neon PostgreSQL
-- Execute este arquivo no SQL Editor do Neon Dashboard
-- Ou use o MCP do Neon para aplicar via CLI

-- ============================================
-- EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profile (extensão do auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Funil Etapas
CREATE TABLE IF NOT EXISTS funil_etapas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  responsible_id UUID REFERENCES auth.users(id),
  current_etapa_id UUID REFERENCES funil_etapas(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  source TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select')),
  options JSONB DEFAULT '[]',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Field Values
CREATE TABLE IF NOT EXISTS lead_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE(lead_id, custom_field_id)
);

-- Funil Campos Obrigatórios
CREATE TABLE IF NOT EXISTS funil_campos_obrigatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etapa_id UUID NOT NULL REFERENCES funil_etapas(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  context TEXT NOT NULL,
  prompt_instructions TEXT NOT NULL,
  trigger_etapa_id UUID REFERENCES funil_etapas(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Messages
CREATE TABLE IF NOT EXISTS lead_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message History
CREATE TABLE IF NOT EXISTS message_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON leads(current_etapa_id);
CREATE INDEX IF NOT EXISTS idx_leads_responsible ON leads(responsible_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_funil_etapas_workspace ON funil_etapas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_trigger ON campaigns(trigger_etapa_id);
CREATE INDEX IF NOT EXISTS idx_lead_messages_lead ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_message_history_lead ON message_history(lead_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE funil_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE funil_campos_obrigatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

-- Policies para workspaces
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update workspaces"
  ON workspaces FOR UPDATE
  USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (true);

-- Policies para workspace_members
CREATE POLICY "Users can view own workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage workspace members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para funil_etapas
CREATE POLICY "Members can view etapas"
  ON funil_etapas FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage etapas"
  ON funil_etapas FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para leads
CREATE POLICY "Members can view leads"
  ON leads FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can insert leads"
  ON leads FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can update leads"
  ON leads FOR UPDATE
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can delete leads"
  ON leads FOR DELETE
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Policies para custom_fields
CREATE POLICY "Members can view custom_fields"
  ON custom_fields FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage custom_fields"
  ON custom_fields FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para campaigns
CREATE POLICY "Members can view campaigns"
  ON campaigns FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para lead_messages
CREATE POLICY "Members can view lead_messages"
  ON lead_messages FOR SELECT
  USING (
    lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can insert lead_messages"
  ON lead_messages FOR INSERT
  WITH CHECK (
    lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can update lead_messages"
  ON lead_messages FOR UPDATE
  USING (
    lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
  );

-- Policies para message_history
CREATE POLICY "Members can view message_history"
  ON message_history FOR SELECT
  USING (
    lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Members can insert message_history"
  ON message_history FOR INSERT
  WITH CHECK (
    lead_id IN (SELECT id FROM leads WHERE workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to validate etapa transition
CREATE OR REPLACE FUNCTION validate_etapa_transition()
RETURNS TRIGGER AS $$
DECLARE
  required_fields TEXT[];
  field_record RECORD;
BEGIN
  IF OLD.current_etapa_id IS NOT DISTINCT FROM NEW.current_etapa_id THEN
    RETURN NEW;
  END IF;

  SELECT array_agg(field_name) INTO required_fields
  FROM funil_campos_obrigatorios
  WHERE etapa_id = NEW.current_etapa_id;

  IF required_fields IS NULL THEN
    RETURN NEW;
  END IF;

  FOREACH field_record IN ARRAY required_fields
  LOOP
    IF field_record.field_name = 'name' AND (NEW.name IS NULL OR NEW.name = '') THEN
      RAISE EXCEPTION 'Campo obrigatório "Nome" não preenchido';
    ELSIF field_record.field_name = 'email' AND (NEW.email IS NULL OR NEW.email = '') THEN
      RAISE EXCEPTION 'Campo obrigatório "Email" não preenchido';
    ELSIF field_record.field_name = 'phone' AND (NEW.phone IS NULL OR NEW.phone = '') THEN
      RAISE EXCEPTION 'Campo obrigatório "Telefone" não preenchido';
    ELSIF field_record.field_name = 'company' AND (NEW.company IS NULL OR NEW.company = '') THEN
      RAISE EXCEPTION 'Campo obrigatório "Empresa" não preenchido';
    ELSIF field_record.field_name = 'job_title' AND (NEW.job_title IS NULL OR NEW.job_title = '') THEN
      RAISE EXCEPTION 'Campo obrigatório "Cargo" não preenchido';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_lead_transition ON leads;
CREATE TRIGGER validate_lead_transition
  BEFORE UPDATE OF current_etapa_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION validate_etapa_transition();

-- Function for auto message generation on trigger etapa
CREATE OR REPLACE FUNCTION trigger_auto_message_generation()
RETURNS TRIGGER AS $$
DECLARE
  campaign_record RECORD;
BEGIN
  IF OLD.current_etapa_id IS NOT DISTINCT FROM NEW.current_etapa_id THEN
    RETURN NEW;
  END IF;

  FOR campaign_record IN
    SELECT c.id, c.workspace_id
    FROM campaigns c
    WHERE c.trigger_etapa_id = NEW.current_etapa_id
    AND c.is_active = TRUE
    AND c.workspace_id = NEW.workspace_id
  LOOP
    INSERT INTO lead_messages (lead_id, campaign_id, status)
    VALUES (NEW.id, campaign_record.id, 'pending');
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_messages ON leads;
CREATE TRIGGER auto_generate_messages
  AFTER UPDATE OF current_etapa_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_message_generation();

-- ============================================
-- SEED DATA (opcional - cria etapas padrão)
-- ============================================
-- As etapas padrão são criadas automaticamente pelo frontend
-- quando um novo workspace é criado

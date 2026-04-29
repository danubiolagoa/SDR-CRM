# Schema do Banco de Dados - SDR CRM (Neon PostgreSQL)

## Estado Atual

- Auth principal em `neon_auth.user`.
- `public.user_profiles` espelha `neon_auth.user` para permitir FKs públicas e consultas do app.
- A migration `supabase/migrations/002_neon_auth_bootstrap.sql` cria trigger de sincronização e backfill idempotente.
- Usuários sem workspace recebem workspace padrão, membership admin e 7 etapas padrão.
- RLS ainda não está habilitado nas tabelas públicas do Neon validado; permissões `GRANT` mantêm o Data API funcional enquanto as policies finais são desenhadas.

## Diagrama ER (Simplificado)

```
┌─────────────────┐       ┌──────────────────────────┐
│  user_profiles  │       │       workspaces         │
│─────────────────│       │──────────────────────────│
│ id (PK)         │       │ id (PK)                  │
│ email           │       │ name                     │
│ name            │       │ created_at               │
└────────┬────────┘       │ updated_at                │
         │                └──────────┬───────────────┘
         │                           │
         │ 1:N                       │ 1:N
         ▼                           ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  workspace_members   │   │       leads             │
│──────────────────────│   │──────────────────────────│
│ id (PK)              │   │ id (PK)                 │
│ workspace_id (FK)    │◄──│ workspace_id (FK)        │
│ user_id (FK)         │   │ responsible_id (FK)     │
│ role                 │   │ current_etapa_id (FK)   │
│ created_at           │   │ name, email, phone...   │
└──────────────────────┘   │ created_at, updated_at  │
                           └──────────┬───────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────────┐   ┌─────────────────┐   ┌────────────────────────┐
│   funil_etapas      │   │  lead_messages  │   │     campaigns          │
│─────────────────────│   │─────────────────│   │────────────────────────│
│ id (PK)             │   │ id (PK)          │   │ id (PK)                │
│ workspace_id (FK)   │   │ lead_id (FK)     │◄──│ workspace_id (FK)       │
│ name                │   │ campaign_id(FK)  │   │ name, description       │
│ position            │   │ messages (JSON) │   │ context, prompt         │
│ is_default          │   │ status           │   │ trigger_etapa_id (FK)   │
└─────────────────────┘   │ created_at       │   │ is_active              │
                           └─────────────────┘   └────────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │  message_history    │
                           │─────────────────────│
                           │ id (PK)             │
                           │ lead_id (FK)        │
                           │ campaign_id (FK)    │
                           │ message_content     │
                           │ sent_at             │
                           └─────────────────────┘

┌─────────────────────┐   ┌─────────────────────────────┐
│   custom_fields     │   │   lead_field_values         │
│─────────────────────│   │─────────────────────────────│
│ id (PK)             │   │ id (PK)                     │
│ workspace_id (FK)   │◄──│ lead_id (FK)                │
│ name                │   │ custom_field_id (FK)        │
│ field_type          │   │ value                       │
│ options (JSONB)     │   └─────────────────────────────┘
│ position            │
└─────────────────────┘

┌─────────────────────────────────────┐
│   funil_campos_obrigatorios         │
│─────────────────────────────────────│
│ id (PK)                             │
│ etapa_id (FK)                       │
│ field_name                          │
│ created_at                          │
└─────────────────────────────────────┘
```

## SQL - Criação de Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profile (separate from auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Funil Etapas
CREATE TABLE funil_etapas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  responsible_id UUID REFERENCES user_profiles(id),
  current_etapa_id UUID REFERENCES funil_etapas(id),
  -- Campos padrão --
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  source TEXT,
  observations TEXT,
  -- Timestamps --
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Fields
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select')),
  options JSONB DEFAULT '[]',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Field Values (valores dos campos personalizados)
CREATE TABLE lead_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE(lead_id, custom_field_id)
);

-- Funil Campos Obrigatórios
CREATE TABLE funil_campos_obrigatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etapa_id UUID NOT NULL REFERENCES funil_etapas(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
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
CREATE TABLE lead_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message History
CREATE TABLE message_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  message_content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Bootstrap Neon Auth

```sql
CREATE OR REPLACE FUNCTION public.sync_neon_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, neon_auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.name, ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;

  RETURN NEW;
END;
$$;
```

## Índices

```sql
CREATE INDEX idx_leads_workspace ON leads(workspace_id);
CREATE INDEX idx_leads_etapa ON leads(current_etapa_id);
CREATE INDEX idx_leads_responsible ON leads(responsible_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_funil_etapas_workspace ON funil_etapas(workspace_id);
CREATE INDEX idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX idx_campaigns_trigger ON campaigns(trigger_etapa_id);
CREATE INDEX idx_lead_messages_lead ON lead_messages(lead_id);
CREATE INDEX idx_message_history_lead ON message_history(lead_id);
```

## Row Level Security (RLS)

**Nota**: Neon Auth já está configurado. RLS ainda será desenhado para os claims reais do Neon Auth; por enquanto o projeto usa `GRANT` nas tabelas públicas para permitir acesso via Neon Data API.

```sql
-- Habilitar RLS em todas as tables (quando Auth estiver configurado)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
-- ... (outras tables)

-- Policies usarão current_user_id() ou similar via Neon Auth JWT claims
-- Exemplo:
-- CREATE POLICY "Users can view own workspaces"
--   ON workspaces FOR SELECT
--   USING (
--     id IN (SELECT workspace_id FROM workspace_members WHERE user_id = current_user_id())
--   );
```

## Função: Validar Transição de Etapa

```sql
CREATE OR REPLACE FUNCTION validate_etapa_transition()
RETURNS TRIGGER AS $$
DECLARE
  required_fields TEXT[];
  field_record RECORD;
BEGIN
  -- Buscar campos obrigatórios para a nova etapa
  SELECT array_agg(field_name) INTO required_fields
  FROM funil_campos_obrigatorios
  WHERE etapa_id = NEW.current_etapa_id;

  -- Se não há campos obrigatórios, permitir
  IF required_fields IS NULL THEN
    RETURN NEW;
  END IF;

  -- Validar cada campo obrigatório
  FOREACH field_record IN ARRAY required_fields
  LOOP
    -- Verificar campos padrão
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
    -- Para campos personalizados, verificar em lead_field_values
    ELSE
      IF NOT EXISTS (
        SELECT 1 FROM lead_field_values lfv
        JOIN custom_fields cf ON cf.id = lfv.custom_field_id
        WHERE lfv.lead_id = NEW.id
        AND cf.name = field_record.field_name
        AND lfv.value IS NOT NULL
        AND lfv.value != ''
      ) THEN
        RAISE EXCEPTION 'Campo obrigatório "%" não preenchido', field_record.field_name;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_lead_transition
  BEFORE UPDATE OF current_etapa_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION validate_etapa_transition();
```

## Trigger: Geração Automática de Mensagens

```sql
CREATE OR REPLACE FUNCTION trigger_auto_message_generation()
RETURNS TRIGGER AS $$
DECLARE
  campaign_record RECORD;
BEGIN
  -- Se a etapa não mudou, não fazer nada
  IF OLD.current_etapa_id IS NOT DISTINCT FROM NEW.current_etapa_id THEN
    RETURN NEW;
  END IF;

  -- Buscar campanhas ativas com gatilho nesta etapa
  FOR campaign_record IN
    SELECT c.id, c.workspace_id
    FROM campaigns c
    WHERE c.trigger_etapa_id = NEW.current_etapa_id
    AND c.is_active = TRUE
    AND c.workspace_id = NEW.workspace_id
  LOOP
    -- Inserir registro pendente para geração
    INSERT INTO lead_messages (lead_id, campaign_id, status)
    VALUES (NEW.id, campaign_record.id, 'pending');
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_messages
  AFTER UPDATE OF current_etapa_id ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_message_generation();
```

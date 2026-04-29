# Arquitetura - SDR CRM

## Visão Geral

Mini CRM para equipes SDR com geração de mensagens via IA.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Vite + Tailwind (via Claude Code) |
| Backend | Neon PostgreSQL + API Routes |
| Database | Neon PostgreSQL |
| Auth | Neon Auth (em breve) |
| IA | OpenRouter (Claude, Gemini, Llama, etc) |
| Deploy | Vercel / Netlify |

## Estrutura do Banco de Dados

### Tables

#### 1. `workspaces`
```sql
id: uuid PK
name: text
created_at: timestamp
updated_at: timestamp
```

#### 2. `workspace_members`
```sql
id: uuid PK
workspace_id: uuid FK → workspaces
user_id: uuid FK → auth.users
role: text (admin | member)
created_at: timestamp
```

#### 3. `users_profile` (extensão do auth)
```sql
id: uuid PK (ref auth.users)
name: text
email: text
created_at: timestamp
```

#### 4. `funil_etapas`
```sql
id: uuid PK
workspace_id: uuid FK → workspaces
name: text
position: integer
is_default: boolean
created_at: timestamp
```

#### 5. `leads`
```sql
id: uuid PK
workspace_id: uuid FK → workspaces
responsible_id: uuid FK → auth.users (nullable)
current_etapa_id: uuid FK → funil_etapas
-- Campos padrão --
name: text
email: text
phone: text
company: text
job_title: text
source: text
observations: text
-- Timestamps --
created_at: timestamp
updated_at: timestamp
```

#### 6. `custom_fields`
```sql
id: uuid PK
workspace_id: uuid FK → workspaces
name: text
field_type: text (text | number | date | select)
options: jsonb (para selects)
position: integer
created_at: timestamp
```

#### 7. `lead_field_values`
```sql
id: uuid PK
lead_id: uuid FK → leads
custom_field_id: uuid FK → custom_fields
value: text
```

#### 8. `funil_campos_obrigatorios`
```sql
id: uuid PK
etapa_id: uuid FK → funil_etapas
field_name: text
created_at: timestamp
```

#### 9. `campaigns`
```sql
id: uuid PK
workspace_id: uuid FK → workspaces
name: text
description: text
context: text
prompt_instructions: text
trigger_etapa_id: uuid FK → funil_etapas (nullable)
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

#### 10. `lead_messages`
```sql
id: uuid PK
lead_id: uuid FK → leads
campaign_id: uuid FK → campaigns
messages: jsonb (array de mensagens geradas)
status: text (pending | generated | sent)
created_at: timestamp
```

#### 11. `message_history`
```sql
id: uuid PK
lead_id: uuid FK → leads
campaign_id: uuid FK → campaigns
message_content: text
sent_at: timestamp
```

## Row Level Security (RLS)

### Policies

1. **Workspaces**: Usuários só acessam workspaces que são membros
2. **Leads**: Todos os leads do workspace
3. **Campaigns**: Campanhas do workspace
4. **Funil Etapas**: Etapas do workspace

## Integração IA

### Fluxo de Geração de Mensagens

```
1. Usuário seleciona lead + campanha
2. Frontend → Edge Function (generate_messages)
3. Edge Function busca dados do lead + campanha
4. Edge Function → OpenRouter API (LLM diversa)
5. OpenRouter retorna mensagens geradas
6. Edge Function salva em lead_messages
7. Frontend exibe mensagens
```

### Geração Automática (Gatilho)

```
1. Lead movido para etapa gatilho (via app)
2. Trigger no banco detecta mudança
3. Edge Function gera mensagens em background
4. Mensagens ficam disponíveis ao acessar lead
```

## API Endpoints (Edge Functions)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/generate-messages` | POST | Gera mensagens para lead + campanha |
| `/regenerate-messages` | POST | Regenera mensagens |
| `/send-message` | POST | Marca mensagem como enviada |
| `/trigger-generation` | POST | Gatilho automático |

## Frontend - Estrutura de Páginas

```
/login - Login/cadastro
/dashboard - Dashboard principal
/workspaces - Gerenciar workspaces
/leads - Lista Kanban de leads
/leads/[id] - Detalhes do lead + mensagens
/campaigns - Gerenciar campanhas
/campaigns/[id] - Editar campanha
/settings - Configurações do workspace
```

## Campos Padrão vs Personalizados

### Campos Padrão (sempre presentes)
- name, email, phone, company, job_title, source, observations

### Campos Personalizados (por workspace)
- Criados na configuração do workspace
- Armazenados em `custom_fields`
- Valores em `lead_field_values`
- Disponíveis no Kanban e na geração de mensagens

## Fluxo Principal

1. **Cadastro/Login** → Cria/entra em workspace
2. **Configurar Funil** → Define etapas
3. **Configurar Campanhas** → Cria contexto e prompts
4. **Cadastrar Leads** → Preenche dados
5. **Mover no Kanban** → Valida campos obrigatórios
6. **Gerar Mensagens** → IA personalizada
7. **Enviar Mensagem** → Simula envio, move para "Tentando Contato"

## Desafios e Soluções

| Desafio | Solução |
|---------|---------|
| Multi-tenant com isolation | RLS + workspace_id em todas tables |
| Campos personalizados flexíveis | Tabela custom_fields + JSONB |
| Geração assíncrona | Edge Functions + triggers no banco |
| Validação de transição | Function no banco valida antes do UPDATE |
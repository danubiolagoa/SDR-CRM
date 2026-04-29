# Arquitetura - SDR CRM

## Visão Geral

Mini CRM para equipes SDR com geração de mensagens via IA.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Vite + Tailwind (via Claude Code) |
| Backend | Neon PostgreSQL + API Routes |
| Database | Neon PostgreSQL |
| Auth | Neon Auth + Better Auth via `@neondatabase/neon-js` |
| IA | OpenRouter (Claude, Gemini, Llama, etc) |
| Deploy | Vercel / Netlify |

## Estado Atual da Aplicação

- Login e cadastro usam Neon Auth.
- O frontend faz bootstrap idempotente de `user_profiles`, workspace padrão, membership admin e etapas padrão.
- A migration `supabase/migrations/002_neon_auth_bootstrap.sql` registra o trigger de sincronização entre `neon_auth.user` e `public.user_profiles`.
- O projeto Neon validado é `plain-rain-34001082`.
- `npm run lint` e `npm run build` passam.
- RLS ainda não está ativo nas tabelas públicas; o Data API usa permissões `GRANT` enquanto as policies definitivas não são implementadas.

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
user_id: uuid FK → user_profiles
role: text (admin | member)
created_at: timestamp
```

#### 3. `user_profiles` (espelho público do auth)
```sql
id: uuid PK (espelha neon_auth.user.id)
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
responsible_id: uuid FK → user_profiles (nullable)
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
2. Frontend → OpenRouter API
3. Frontend busca dados do lead + campanha no Neon Data API
4. OpenRouter retorna mensagens geradas
5. Frontend salva o resultado em `lead_messages`
6. Frontend exibe mensagens
```

### Geração Automática (Gatilho)

```
1. Lead movido para etapa gatilho (via app)
2. Trigger no banco detecta mudança
3. Trigger cria registros pendentes em `lead_messages`
4. Processamento assíncrono ainda está pendente
```

## APIs de Geração

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `OpenRouter chat/completions` | POST | Usado diretamente pelo frontend para gerar mensagens |
| `supabase/functions/generate-messages` | POST | Função legada mantida no repo, não é o caminho principal atual |

## Frontend - Estrutura de Páginas

```
/login - Login/cadastro
/dashboard - Dashboard principal
/leads - Lista Kanban de leads
/campaigns - Gerenciar campanhas
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
| Geração assíncrona | Trigger cria pendências; processamento em background ainda pendente |
| Validação de transição | Function no banco valida antes do UPDATE |

# Planejamento - SDR CRM com Gerador de Mensagens IA

## Contexto

Desenvolver um Mini CRM para equipes de Pré-Vendas (SDR) com integração de IA para geração de mensagens personalizadas. O projeto utiliza **Neon** (PostgreSQL) + **Frontend Vibe Coding** (Loveable/Bolt.new/v0).

---

## Decisões Técnicas Principais

### Stack Escolhida
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (via Claude Code)
- **Banco de Dados**: Neon PostgreSQL
- **Autenticação**: Neon Auth (a implementar)
- **IA**: OpenRouter (diversas LLMs disponíveis - Claude, Gemini, Llama, etc)
- **Infra**: Deploy manual ou Vercel/Netlify

### Estrutura do Banco de Dados

#### Tables principais:

| Tabela | Descrição |
|--------|-----------|
| `workspaces` | Workspaces (empresa/equipe) |
| `workspace_members` | Vinculação usuário ↔ workspace com papel |
| `leads` | Leads com campos padrão + customizados |
| `funil_etapas` | Etapas configuráveis do funil |
| `funil_campos_obrigatorios` | Campos obrigatórios por etapa |
| `campaigns` | Campanhas de abordagem |
| `campaign_prompts` | Configuração de prompts por campanha |
| `lead_messages` | Mensagens geradas para cada lead |
| `message_history` | Histórico de mensagens enviadas |
| `custom_fields` | Campos personalizados por workspace |

#### Relação entre entidades:
- `workspaces` 1:N `workspace_members`
- `workspace_members` N:N `users` (via auth)
- `workspaces` 1:N `leads`
- `workspaces` 1:N `funil_etapas`
- `workspaces` 1:N `campaigns`
- `leads` N:1 `users` (responsável)
- `leads` N:1 `funil_etapas` (etapa atual)
- `leads` 1:N `lead_messages`
- `lead_messages` N:1 `campaigns`

### Arquitetura de Integração IA

```
Lead + Campanha → Edge Function → OpenAI API → Mensagens personalizadas
```

1. **Geração Manual**: Quando usuário seleciona campanha e clica "Gerar"
2. **Geração Automática (Gatilho)**: Row Level Security + Edge Function + pg_webhooks

---

## Fases de Desenvolvimento

### Fase 1: Fundações
- [ ] Configurar projeto Supabase (tabelas, RLS, auth)
- [ ] Criar Edge Functions básicas
- [ ] Setup inicial do frontend
- [ ] Implementar autenticação

### Fase 2: Workspaces e Membros
- [ ] CRUD de workspaces
- [ ] CRUD de membros com papéis
- [ ] Convite de usuários (diferencial)

### Fase 3: Gestão de Leads e Funil
- [ ] CRUD de leads
- [ ] Campos personalizados
- [ ] Funil Kanban com drag-and-drop
- [ ] Regras de transição entre etapas

### Fase 4: Campanhas e Geração IA
- [ ] CRUD de campanhas
- [ ] Integração OpenAI para geração
- [ ] Visualização e regeneração de mensagens
- [ ] Simulação de envio

### Fase 5: Gatilhos e Automação
- [ ] Webhooks para detectar movimentação de leads
- [ ] Geração automática por etapa gatilho
- [ ] Processamento assíncrono

### Fase 6: Dashboard
- [ ] Métricas básicas (leads por etapa)
- [ ] Diferenciais: taxa de conversão, filtros

---

## Arquivos a Criar

### `/docs/Planejamento.md` (este arquivo)
### `/docs/Arquitetura.md` - Decisões técnicas detalhadas
### `/docs/DatabaseSchema.md` - Schema completo do banco
### `/docs/Roadmap.md` - Cronograma de execução

---

## Funcionalidades Entregues

### Obrigatórias
- [ ] Autenticação e workspaces
- [ ] Gestão de leads (CRUD, Kanban)
- [ ] Funil de pré-vendas configurável
- [ ] Campanhas com contexto e prompt
- [ ] Geração de mensagens com IA
- [ ] Dashboard com métricas

### Diferenciais
- [ ] Geração automática por gatilho
- [ ] Edição do funil
- [ ] Campos personalizados
- [ ] Responsável por lead
- [ ] Regras de transição
- [ ] Filtros e busca

---

## Como Testar

1. Acessar aplicação publicada
2. Fazer cadastro/login
3. Criar workspace
4. Cadastrar lead
5. Criar campanha
6. Gerar mensagens com IA
7. Validar fluxo completo
# Planejamento - SDR CRM com Gerador de Mensagens IA

## Contexto

Desenvolver um Mini CRM para equipes de Pré-Vendas (SDR) com integração de IA para geração de mensagens personalizadas. O projeto utiliza **Neon** (PostgreSQL) + **Frontend Vibe Coding** (Loveable/Bolt.new/v0).

---

## Decisões Técnicas Principais

### Stack Escolhida
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (via Claude Code)
- **Banco de Dados**: Neon PostgreSQL
- **Autenticação**: Neon Auth via `@neondatabase/neon-js`
- **IA**: OpenRouter (diversas LLMs disponíveis - Claude, Gemini, Llama, etc)
- **Infra**: Deploy manual ou Vercel/Netlify

### Estado Atual

- Aplicação local roda com Vite em `http://127.0.0.1:5173`.
- Login/cadastro estão integrados ao Neon Auth.
- Bootstrap de usuário cria/recupera `user_profiles`, workspace padrão, membership admin e etapas padrão.
- Loop de localhost após cadastro foi corrigido; usuário sem workspace recebe tela de recuperação em vez de spinner infinito.
- Banco Neon validado no projeto `plain-rain-34001082`.
- `npm run lint` e `npm run build` passam.
- Próximo hardening: ativar RLS/policies específicas para Neon Auth; hoje as tabelas públicas usam `GRANT` para funcionamento via Data API.

### Estrutura do Banco de Dados

#### Tables principais:

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `workspaces` | Workspaces (empresa/equipe) | ✅ |
| `workspace_members` | Vinculação usuário ↔ workspace com papel | ✅ |
| `user_profiles` | Espelho público de `neon_auth.user` usado pelas FKs do app | ✅ |
| `leads` | Leads com campos padrão + customizados | ✅ |
| `funil_etapas` | Etapas configuráveis do funil | ✅ |
| `funil_campos_obrigatorios` | Campos obrigatórios por etapa | ✅ |
| `campaigns` | Campanhas de abordagem | ✅ |
| ~~`campaign_prompts`~~ | ~~Configuração de prompts por campanha~~ | ⚠️ Merge em `campaigns` |
| `lead_messages` | Mensagens geradas para cada lead | ✅ |
| `message_history` | Histórico de mensagens enviadas | ✅ |
| `custom_fields` | Campos personalizados por workspace | ✅ |

#### Relação entre entidades:
- `workspaces` 1:N `workspace_members`
- `workspace_members` N:N `user_profiles` (espelha `neon_auth.user`)
- `workspaces` 1:N `leads`
- `workspaces` 1:N `funil_etapas`
- `workspaces` 1:N `campaigns`
- `leads` N:1 `users` (responsável)
- `leads` N:1 `funil_etapas` (etapa atual)
- `leads` 1:N `lead_messages`
- `lead_messages` N:1 `campaigns`

### Arquitetura de Integração IA

```
Lead + Campanha → Frontend → OpenRouter API → Mensagens personalizadas
```

1. **Geração Manual**: Quando usuário seleciona campanha e clica "Gerar"
2. **Geração Automática (Gatilho)**: trigger cria pendências em `lead_messages`; processamento assíncrono ainda pendente

---

## Fases de Desenvolvimento

### Fase 1: Fundações
- [x] Configurar projeto Neon (tabelas, Auth, Data API)
- [x] Setup inicial do frontend
- [x] Implementar autenticação
- [x] Corrigir bootstrap de workspace no cadastro/login
- [ ] Definir RLS/policies finais para Neon Auth

### Fase 2: Workspaces e Membros
- [x] Criar workspace padrão no cadastro/login
- [x] Listar membros do workspace
- [ ] CRUD completo de workspaces
- [ ] Convite de usuários (diferencial)

### Fase 3: Gestão de Leads e Funil
- [x] CRUD de leads
- [x] Campos personalizados
- [x] Funil Kanban com drag-and-drop
- [x] Regras de transição entre etapas

### Fase 4: Campanhas e Geração IA
- [x] CRUD de campanhas
- [x] Integração OpenRouter para geração manual
- [ ] Mover geração IA para backend seguro
- [x] Visualização e regeneração de mensagens
- [ ] Simulação de envio

### Fase 5: Gatilhos e Automação
- [ ] Webhooks para detectar movimentação de leads
- [ ] Geração automática por etapa gatilho
- [ ] Processamento assíncrono

### Fase 6: Dashboard
- [x] Métricas básicas (leads por etapa)
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
- [x] Autenticação e workspaces
- [x] Gestão de leads (CRUD, Kanban)
- [x] Funil de pré-vendas configurável
- [x] Campanhas com contexto e prompt
- [x] Geração de mensagens com IA
- [x] Dashboard com métricas

### Diferenciais
- [x] Campos personalizados
- [x] Responsável por lead (partial - verificado no card)
- [ ] Geração automática por gatilho
- [x] Edição do funil (visualização)
- [ ] Regras de transição (validação implementada, edição pendente)
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

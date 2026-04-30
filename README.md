# SDR CRM

Mini CRM para equipes SDR com funil de leads, workspaces, campanhas e geração de mensagens com IA.

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Estilização**: Tailwind CSS 4 + Framer Motion
- **State**: Zustand com persistência localStorage
- **Banco**: Neon PostgreSQL (serverless)
- **Auth**: Neon Auth (Better Auth) via `@neondatabase/neon-js`
- **IA**: OpenRouter API (Minimax M2.7) para geração de mensagens

## Funcionalidades

### Autenticação e Workspaces
- Login e cadastro com email/senha
- Validação de força de senha (visual com indicadores)
- Multi-tenancy com workspaces isolados
- Bootstrapping automático de usuário (profile + workspace + etapas)
- Troca de workspace pelo header

### Pipeline de Leads (Kanban)
- Visualização em formato Kanban por etapas do funil
- Drag-and-drop entre colunas com @dnd-kit
- Criação, edição e exclusão de leads
- Validação de campos obrigatórios por etapa
- Campos: nome, email, telefone, empresa, cargo, origem, observações
- Responsável pelo lead com avatar

### Dashboard
- Cards de métricas (total leads, taxa qualificação, campanhas ativas, etapas)
- Gráfico de barras: distribuição por etapa
- Gráfico de pizza: proporção por etapa
- Gráfico de linha: evolução de leads
- Lista de leads recentes

### Campanhas e IA
- CRUD completo de campanhas
- Tags personalizáveis: `#nome`, `#empresa`, `#cargo`, `#email`, `#telefone`, `#origem`
- Prompt de instruções customizável
- Etapa gatilho (opcional)
- Geração de 3 variações de mensagem fria B2B
- Copy to clipboard
- Status: pending, generated, sent

### Configurações
- **Geral**: Nome do workspace (persistente)
- **Membros**: Adicionar/remover membros, roles admin/member
- **Funil**: CRUD de etapas, cores customizadas, reorder, etapa padrão
- **Campos**: Campos customizados (texto, número, data, select com opções)

## Comandos

```bash
npm run dev      # servidor local Vite
npm run build    # typecheck + build de produção
npm run lint     # ESLint
npm run preview  # preview do build de produção
```

## Ambiente

Crie `.env.local` a partir do exemplo:

```bash
VITE_NEON_AUTH_URL=        # URL do Neon Auth
VITE_NEON_DATA_API_URL=    # URL do Neon Data API
VITE_OPENROUTER_API_KEY=   # Chave da OpenRouter (opcional para testes básicos)
```

> Sem `VITE_OPENROUTER_API_KEY`, é possível testar login, workspaces, leads e navegação. A geração de mensagens requer a chave configurada.

## Estado Atual

- Login/cadastro usam Neon Auth via `@neondatabase/neon-js`.
- Bootstrap idempotente: `user_profiles`, workspace padrão, membership admin e 7 etapas do funil.
- O app mostra tela de recuperação quando usuário existe sem workspace.
- RLS (Row Level Security) ativo para isolamento multi-tenant.
- Campos customizados renderizados nos formulários de leads.
- Nome do workspace persistente nas configurações.
- `npm run lint` e `npm run build` passam.

## Estrutura do Projeto

```
src/
├── pages/           # Telas (Login, Dashboard, Leads, Campaigns, Settings)
├── components/      # Componentes UI e Layout
├── stores/          # Zustand (authStore, leadsStore)
├── lib/             # Neon client, cores de etapas
└── types/           # Tipos TypeScript

supabase/migrations/ # Schema SQL e migrations
docs/                # Arquitetura, schema, roadmap
```

## Documentação

- `docs/Arquitetura.md`: Visão técnica e fluxo da aplicação
- `docs/DatabaseSchema.md`: Tabelas, relações e permissões
- `docs/Roadmap.md`: Progresso funcional e planejamento
- `docs/DesignSystem.md`: Sistema de design e componentes
- `CLAUDE.md`: Guia para Claude Code
- `AGENTS.md`: Diretrizes para desenvolvedores

# SDR CRM

Mini CRM para equipes SDR com funil de leads, workspaces, campanhas e geração de mensagens com IA.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand para estado local
- Neon PostgreSQL + Neon Auth + Neon Data API
- OpenRouter para geração de mensagens

## Comandos

```bash
npm run dev      # servidor local Vite
npm run build    # typecheck + build de produção
npm run lint     # ESLint
npm run preview  # preview do build
```

## Ambiente

Crie `.env.local` a partir de `.env.example`:

```bash
VITE_NEON_AUTH_URL=
VITE_NEON_DATA_API_URL=
VITE_OPENROUTER_API_KEY=
```

`VITE_OPENROUTER_API_KEY` pode ficar vazio para testar login, workspaces, leads e navegação sem geração de IA.

## Estado Atual

- Login/cadastro usam Neon Auth via `@neondatabase/neon-js`.
- O bootstrap de usuário garante `user_profiles`, workspace padrão, membership admin e etapas padrão do funil.
- O app evita loop infinito quando há usuário sem workspace e mostra uma ação de recuperação.
- O schema live foi alinhado pela migration `supabase/migrations/002_neon_auth_bootstrap.sql`.
- `npm run lint` e `npm run build` passam.

## Documentação

- `docs/Arquitetura.md`: visão técnica e fluxo da aplicação.
- `docs/DatabaseSchema.md`: tabelas, relações e estado de permissões.
- `docs/Roadmap.md`: progresso funcional do MVP.
- `AGENTS.md`: guia de contribuição para agentes e desenvolvedores.

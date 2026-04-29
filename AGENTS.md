# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds the React + TypeScript app.
  - `src/pages/` contains route-level screens (`LoginPage.tsx`, `DashboardPage.tsx`, `LeadsPage.tsx`, `CampaignsPage.tsx`, `SettingsPage.tsx`).
  - `src/components/` contains shared UI/layout pieces.
  - `src/stores/` contains Zustand state (`authStore.ts`, `leadsStore.ts`).
  - `src/lib/` contains integration helpers, including Neon access.
- `public/` contains static assets such as `favicon.svg` and `icons.svg`.
- `supabase/` contains database migrations and edge/function code.
- `docs/` contains project specs and architecture notes.
- `scripts/` contains PowerShell helpers for MCP setup.

## Build, Test, and Development Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript compilation and produces a production build.
- `npm run lint` runs ESLint across the repository.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions

- Use TypeScript and React functional components.
- Follow the existing 2-space indentation and semicolon-terminated style in the codebase.
- Name page components with `PascalCase` and keep files aligned with the feature name, for example `LeadsPage.tsx` and `authStore.ts`.
- Prefer small, focused modules and keep business logic near the store or helper that owns it.
- ESLint is the primary linting tool (`eslint.config.js`); run it before opening a PR.

## Testing Guidelines

- There is no dedicated automated test runner configured yet.
- Validate changes with `npm run build` and `npm run lint` before merging.
- If you add tests later, keep them close to the feature and use clear names that reflect the user flow or unit under test.

## Commit & Pull Request Guidelines

- Recent commits use short, imperative prefixes like `Fix:` and `Restructure:`.
- Keep commits focused on a single concern and describe the visible effect.
- PRs should include a concise summary, validation steps, and screenshots or recordings when UI changes are involved.

## Security & Configuration Tips

- Copy `.env.example` to `.env.local` and set `VITE_NEON_AUTH_URL`, `VITE_NEON_DATA_API_URL`, and `VITE_OPENROUTER_API_KEY`.
- Never commit local secrets or API keys.
- If you change database behavior, update the matching migration or function under `supabase/` and document the impact in `docs/` when relevant.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SDR CRM is a B2B sales pipeline management application built with React + TypeScript + Vite. It uses Neon PostgreSQL (with better-auth) for authentication and data, Zustand for state management, and OpenRouter API for AI-powered message generation.

## Current State

- Neon Auth is active through `@neondatabase/neon-js`.
- New or returning users are bootstrapped into `user_profiles`, a default workspace, an admin membership, and the default pipeline stages.
- `ProtectedRoute` no longer spins forever when a user exists without a workspace; it shows a recovery screen.
- Live Neon project `plain-rain-34001082` has been aligned with `supabase/migrations/002_neon_auth_bootstrap.sql`.
- `npm run lint` and `npm run build` pass.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Environment Variables

Required in `.env.local`:
- `VITE_NEON_AUTH_URL` - Neon Auth endpoint
- `VITE_NEON_DATA_API_URL` - Neon Data API endpoint
- `VITE_OPENROUTER_API_KEY` - OpenRouter API key for AI message generation

## Architecture

### State Management (Zustand)

- **authStore** (`src/stores/authStore.ts`) - Authentication, workspaces, user sessions. Persisted to localStorage.
- **leadsStore** (`src/stores/leadsStore.ts`) - Leads, pipeline stages (etapas), campaigns, AI message generation.

### Database Schema (Neon PostgreSQL)

Core auth table: `neon_auth.user`.

Core public tables: `user_profiles`, `workspaces`, `workspace_members`, `leads`, `funil_etapas`, `custom_fields`, `lead_field_values`, `campaigns`, `lead_messages`, `message_history`, `funil_campos_obrigatorios`.

The app uses workspace-based multi-tenancy. All data is scoped to `workspace_id`.

### Routes

- `/login` - Login/Register page
- `/` - Dashboard
- `/leads` - Lead pipeline management (Kanban-style by etapa)
- `/campaigns` - Campaign management with AI message generation
- `/settings` - Workspace settings

### Key Patterns

- Protected routes redirect to `/login` if user is not authenticated
- Auth bootstrap should be idempotent; never assume a user already has profile/workspace rows
- Leads can only be moved between pipeline stages if required fields for that stage are filled
- AI message generation uses OpenRouter with `anthropic/claude-3-haiku-20240307` model

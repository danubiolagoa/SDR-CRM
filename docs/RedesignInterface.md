# Plano: Redesign da Interface SDR CRM

## Contexto
O usuário solicitou um redesign completo da interface para um visual mais moderno, minimalista, com transições suaves e responsividade mobile. A interface atual foi descrita como "defasada".

## Objetivo
Criar uma interface minimalista e moderna com:
- Paleta de cores atualizada
- Transições suaves (fade, slide, scale)
- Micro-interações (hover, press effects)
- Mobile-first responsive
- Reutilização de componentes UI

---

## TODO List - Progresso

```
✅ [completed] Instalar dependências (framer-motion, clsx, tailwind-merge)
✅ [completed] Atualizar tailwind.config.js com custom theme
✅ [completed] Atualizar src/index.css com CSS variables + keyframes
✅ [completed] Criar src/lib/animation.ts - Animation variants
✅ [completed] Criar src/hooks/useMediaQuery.ts - Hook
✅ [completed] Criar src/components/ui/cn.ts - Helper classnames
✅ [completed] Criar src/components/ui/Button.tsx
✅ [completed] Criar src/components/ui/Input.tsx (Input, Textarea, Select)
✅ [completed] Criar src/components/ui/Badge.tsx
✅ [completed] Criar src/components/ui/Card.tsx (Card, StatCard)
✅ [completed] Criar src/components/ui/Modal.tsx
✅ [completed] Criar src/components/ui/Avatar.tsx
✅ [completed] Redesenhar src/components/Layout.tsx (mobile drawer)
✅ [completed] Atualizar LoginPage.tsx
✅ [completed] Atualizar DashboardPage.tsx
✅ [completed] Atualizar LeadsPage.tsx
✅ [completed] Atualizar CampaignsPage.tsx
✅ [completed] Atualizar SettingsPage.tsx
```

---

## Abordagem Implementada

### 1. Dependências Instaladas
```bash
npm install framer-motion clsx tailwind-merge
```

### 2. Foundation Atualizada (Phase 1)
- **`tailwind.config.js`** - Cores customizadas, animações, sombras, border-radius
- **`src/index.css`** - CSS variables atualizadas, keyframes de animação
- **`src/lib/animation.ts`** - Animation variants para framer-motion (fadeIn, slideUp, scaleIn, etc)
- **`src/hooks/useMediaQuery.ts`** - Hook para responsividade

### 3. Componentes UI Criados (Phase 2)
Em `src/components/ui/`:
- `Button.tsx` - variants: primary, secondary, ghost, danger
- `Input.tsx` - Input, Textarea, Select com label, error, icon
- `Badge.tsx` - status e etapa badges
- `Card.tsx` - Card e StatCard com hover effects
- `Modal.tsx` - overlay com backdrop blur, scale animation
- `Avatar.tsx` - com fallback para iniciais
- `cn.ts` - helper para merge de classes

### 4. Layout Redesenado (Phase 3)
- Header com logo + hamburger menu
- Sidebar como drawer mobile (slide-in com framer-motion)
- Backdrop blur no overlay
- Animações suaves

### 5. Pages Atualizadas (Phase 4)
| Page | Status |
|------|--------|
| `LoginPage.tsx` | ✅ Modernizado com transições suaves |
| `DashboardPage.tsx` | ✅ Cards com hover lift, staggered animations |
| `LeadsPage.tsx` | ✅ Kanban cards com effects, drag suave |
| `CampaignsPage.tsx` | ✅ Cards com Badge status |
| `SettingsPage.tsx` | ✅ Tabs com indicador animado |

---

## Arquivos Criados/Modificados

### Foundation
- `tailwind.config.js` - Custom theme ✅
- `src/index.css` - CSS variables + keyframes ✅
- `src/lib/animation.ts` - Animation variants ✅ (NOVO)
- `src/hooks/useMediaQuery.ts` - Hook ✅ (NOVO)

### Components UI
- `src/components/ui/Button.tsx` ✅ (NOVO)
- `src/components/ui/Input.tsx` ✅ (NOVO)
- `src/components/ui/Badge.tsx` ✅ (NOVO)
- `src/components/ui/Card.tsx` ✅ (NOVO)
- `src/components/ui/Modal.tsx` ✅ (NOVO)
- `src/components/ui/Avatar.tsx` ✅ (NOVO)
- `src/components/ui/cn.ts` ✅ (NOVO)
- `src/components/ui/index.ts` ✅ (NOVO)

### Layout + Pages
- `src/components/Layout.tsx` - Redesign mobile drawer ✅
- `src/pages/LoginPage.tsx` - Modernizado ✅
- `src/pages/DashboardPage.tsx` - Cards melhorados ✅
- `src/pages/LeadsPage.tsx` - Kanban responsivo ✅
- `src/pages/CampaignsPage.tsx` - Cards redesenhados ✅
- `src/pages/SettingsPage.tsx` - Tabs animados ✅

---

## Cores do Design System Implementadas

```css
--accent-primary: #6366F1   /* Indigo-500 - ações principais */
--bg-secondary:   #F8FAFC   /* Fundo cards */
--bg-tertiary:    #F1F5F9   /* Hover states */
--border:         #E2E8F0   /* Bordas sutis */
--text-primary:   #0F172A   /* Títulos */
--text-secondary: #475569   /* Texto secundário */
--text-muted:     #94A3B8   /* Labels */
```

## Animações Implementadas
- Fade In: 200ms ease-out
- Slide Up: 200ms ease-out
- Modal Enter: 300ms spring
- Hover effects: 150ms

---

## Verificação

1. ✅ `npm run lint` - Passa sem erros
2. ✅ `npm run build` - Compila sem erros
3. Interface responsiva com breakpoints mobile/tablet/desktop
4. Drawer mobile com hamburger
5. Modais com animações suaves
6. Cards com hover lift effect

---

## Data de Conclusão
2026-04-29

## Status Final
✅ COMPLETO - Todos os itens implementados
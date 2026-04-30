# Design System - SDR CRM

## Visão Geral
Interface minimalista e moderna com foco em clareza, transições suaves e responsividade mobile-first.

---

## Paleta de Cores

### Cores Primárias
```
--bg-primary:     #FFFFFF    (fundo principal)
--bg-secondary:   #F8FAFC    (fundo secundário/cards)
--bg-tertiary:    #F1F5F9    (hover states)
--border:         #E2E8F0    (bordas sutis)
--border-focus:   #CBD5E1    (bordas em focus)
```

### Cores de Texto
```
--text-primary:   #0F172A    (títulos, texto principal)
--text-secondary: #475569    (texto secundário)
--text-muted:     #94A3B8    (placeholders, labels)
```

### Cores de Accent
```
--accent-primary: #6366F1    (indigo-500, ações principais)
--accent-hover:   #4F46E5    (indigo-600, hover)
--accent-subtle:  #EEF2FF    (background sutil de accent)
```

### Cores de Status
```
--success:        #10B981    (emerald-500)
--warning:        #F59E0B    (amber-500)
--error:          #EF4444    (red-500)
--info:           #3B82F6    (blue-500)
```

### Cores das Etapas do Funil
```
--etapa-base:         #64748B    (slate-500)
--etapa-lead:         #3B82F6    (blue-500)
--etapa-tentando:     #F59E0B    (amber-500)
--etapa-conexao:      #8B5CF6    (violet-500)
--etapa-desqual:      #EF4444    (red-500)
--etapa-qualificado:  #10B981    (emerald-500)
--etapa-reuniao:      #06B6D4    (cyan-500)
```

---

## Tipografia

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Escalas
```
--text-xs:     0.75rem / 1rem     (12px, labels pequenos)
--text-sm:     0.875rem / 1.25rem (14px, texto secundário)
--text-base:   1rem / 1.5rem     (16px, corpo do texto)
--text-lg:     1.125rem / 1.75rem (18px, títulos menores)
--text-xl:     1.25rem / 1.875rem (20px, títulos de seção)
--text-2xl:    1.5rem / 2rem      (24px, títulos de página)
--text-3xl:    1.875rem / 2.25rem (30px, heros)
```

### Pesos
```
--font-normal:   400
--font-medium:   500
--font-semibold: 600
--font-bold:     700
```

---

## Espaçamento

### Sistema de 4px
```
--space-1:   0.25rem  (4px)
--space-2:   0.5rem   (8px)
--space-3:   0.75rem  (12px)
--space-4:   1rem     (16px)
--space-5:   1.25rem  (20px)
--space-6:   1.5rem   (24px)
--space-8:   2rem     (32px)
--space-10:  2.5rem   (40px)
--space-12:  3rem     (48px)
```

---

## Border Radius

```
--radius-sm:   0.375rem  (6px, inputs)
--radius-md:   0.5rem    (8px, cards)
--radius-lg:    0.75rem   (12px, modais)
--radius-xl:    1rem      (16px, elementos grandes)
--radius-full: 9999px     (pill buttons)
```

---

## Sombras

```
--shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

---

## Componentes

### Botões

#### Primary Button
```css
/* Default */
background: var(--accent-primary);
color: white;
border-radius: var(--radius-lg);
padding: var(--space-3) var(--space-5);
font-weight: var(--font-medium);
transition: all 0.2s ease;

/* Hover */
background: var(--accent-hover);
transform: translateY(-1px);
box-shadow: var(--shadow-md);

/* Active */
transform: translateY(0);
box-shadow: var(--shadow-sm);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### Secondary Button
```css
background: transparent;
border: 1px solid var(--border);
color: var(--text-primary);

/* Hover */
background: var(--bg-tertiary);
border-color: var(--border-focus);
```

#### Ghost Button
```css
background: transparent;
color: var(--text-secondary);

/* Hover */
background: var(--bg-tertiary);
color: var(--text-primary);
```

#### Icon Button
```css
/* Circular, 40px x 40px */
background: transparent;
border-radius: var(--radius-full);

/* Hover */
background: var(--bg-tertiary);
```

### Inputs

```css
/* Container */
border: 1px solid var(--border);
border-radius: var(--radius-md);
background: white;
transition: all 0.2s ease;

/* Focus */
border-color: var(--accent-primary);
box-shadow: 0 0 0 3px var(--accent-subtle);
outline: none;

/* Error */
border-color: var(--error);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

### Cards

```css
background: white;
border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding: var(--space-5);
transition: all 0.2s ease;

/* Hover (interativo) */
border-color: var(--border-focus);
box-shadow: var(--shadow-md);
transform: translateY(-2px);
```

### Modais

```css
/* Overlay */
background: rgba(15, 23, 42, 0.4);
backdrop-filter: blur(4px);

/* Container */
background: white;
border-radius: var(--radius-xl);
box-shadow: var(--shadow-xl);
max-width: 32rem (512px);
animation: modalEnter 0.3s ease;
```

### Sidebar / Layout

```css
/* Background */
background: var(--bg-secondary);
border-right: 1px solid var(--border);

/* Nav Items */
padding: var(--space-3) var(--space-4);
border-radius: var(--radius-md);
color: var(--text-secondary);
transition: all 0.2s ease;

/* Active */
background: var(--accent-subtle);
color: var(--accent-primary);
font-weight: var(--font-medium);

/* Hover */
background: var(--bg-tertiary);
```

### Kanban Cards

```css
background: white;
border: 1px solid var(--border);
border-radius: var(--radius-md);
padding: var(--space-4);
cursor: grab;
transition: all 0.2s ease;

/* Hover */
border-color: var(--border-focus);
box-shadow: var(--shadow-sm);
transform: translateY(-1px);

/* Dragging */
opacity: 0.8;
box-shadow: var(--shadow-xl);
transform: rotate(2deg) scale(1.02);
```

### Badges / Tags

```css
padding: var(--space-1) var(--space-3);
border-radius: var(--radius-full);
font-size: var(--text-xs);
font-weight: var(--font-medium);

/* Status Badge */
background: color with 10% opacity;
color: status color;
```

---

## Animações e Transições

### Timing Functions
```css
--ease-out:    cubic-bezier(0.33, 1, 0.68, 1);   /* ease-out */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* ease-in-out */
--spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* spring effect */
```

### Durações
```css
--duration-fast:   150ms   /* micro-interactions */
--duration-normal: 200ms   /* standard transitions */
--duration-slow:   300ms   /* complex animations */
--duration-slower: 400ms   /* page transitions */
```

### Animações Préescritas

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale In */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Modal Enter */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Micro-interactions

```css
/* Button Press */
button:active {
  transform: scale(0.98);
}

/* Input Focus */
input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

/* Card Hover */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Link Hover */
a:hover {
  color: var(--accent-primary);
}

/* Sidebar Item Hover */
.nav-item:hover {
  background: var(--bg-tertiary);
}
```

---

## Responsividade

### Breakpoints
```css
--sm:  640px   /* phones landscape */
--md:  768px   /* tablets */
--lg:  1024px  /* laptops */
--xl:  1280px  /* desktops */
--2xl: 1536px  /* large screens */
```

### Layout Mobile

#### Header Mobile
```
- Logo à esquerda
- Menu hamburger à direita
- Height: 56px
- Background: white com blur
```

#### Sidebar Mobile
```
- Overlay full screen
- Fechar ao clicar fora
- Slide-in da esquerda (300ms)
```

#### Cards Mobile
```
- Grid 1 coluna (100%)
- Padding reduzido
- Font-size ajustado
```

#### Kanban Mobile
```
- Scroll horizontal
- Cards com width fixo (280px)
- Indicador de scroll lateral
```

#### Modal Mobile
```
- Full screen em mobile
- Border-radius 0
- Slide up animation
```

### Touch Targets
```
- Mínimo: 44px x 44px (iOS guidelines)
- Botões: 48px de altura mínimo
- Inputs: 48px de altura mínimo
- Touch areas: 8px de espaço entre alvos
```

---

## Estrutura de Layout

### Desktop (1024px+)
```
┌──────────────────────────────────────────────────┐
│ Header (64px)                                     │
├────────────┬───────────────────────────────────────┤
│            │                                       │
│  Sidebar   │        Main Content                  │
│  (240px)   │                                       │
│            │                                       │
│            │                                       │
└────────────┴───────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────┐
│ Header (56px)      │
├────────────────────┤
│                    │
│   Main Content     │
│   (full width)     │
│                    │
│                    │
└────────────────────┘
```

### Layout App.tsx
```tsx
// Header com logo + menu
// Sidebar colapsável
// Content area com padding responsivo
```

---

## Checklist de Implementação

### Globais
- [ ] CSS Variables no tailwind.config.js
- [ ] Font Inter no index.html
- [ ] Configuração de animações CSS

### Componentes
- [ ] Button (primary, secondary, ghost, icon)
- [ ] Input (text, email, password, select, textarea)
- [ ] Card (stat, lead, campaign)
- [ ] Badge (status, etapa)
- [ ] Modal (overlay, content, header, footer)
- [ ] Avatar
- [ ] Tabs
- [ ] Dropdown

### Pages
- [ ] LoginPage (formulário minimalista)
- [ ] DashboardPage (cards com hierarquia)
- [ ] LeadsPage (kanban responsivo)
- [ ] CampaignsPage (cards grid)
- [ ] SettingsPage (tabs com conteúdo)

### Layout
- [ ] Layout.tsx (header, sidebar, content)
- [ ] Responsividade mobile (sidebar hamburger)
- [ ] Navegação suave
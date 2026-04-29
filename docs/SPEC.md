# SPEC - SDR CRM com Gerador de Mensagens IA

## 1. Conceito & Visão

Mini CRM para equipes SDR (Sales Development Representatives) que automatiza a criação de mensagens personalizadas usando IA. A experiência deve ser **ágil e focada em conversão** - o usuário deve conseguir criar um lead, selecionar uma campanha e gerar mensagens personalizadas em poucos cliques.

**Personalidade**: Profissional, direto, eficiente. Interface limpa que prioriza ação.

---

## 2. Design Language

### Estética
Inspiração: Linear + Notion. Minimalismo funcional com toques de cor para identificar etapas do funil.

### Paleta de Cores
```
Primary:      #6366F1 (Indigo)
Secondary:    #8B5CF6 (Violet)
Accent:       #10B981 (Emerald - para sucesso)
Warning:      #F59E0B (Amber)
Danger:       #EF4444 (Red)

Background:   #FAFAFA (Light gray)
Surface:      #FFFFFF (White)
Text Primary: #1F2937 (Gray 800)
Text Muted:   #6B7280 (Gray 500)
Border:       #E5E7EB (Gray 200)
```

### Etapas do Funil (cores fixas)
```
Base:                 #94A3B8 (Slate)
Lead Mapeado:        #3B82F6 (Blue)
Tentando Contato:    #F59E0B (Amber)
Conexão Iniciada:    #8B5CF6 (Violet)
Desqualificado:      #EF4444 (Red)
Qualificado:         #10B981 (Emerald)
Reunião Agendada:    #06B6D4 (Cyan)
```

### Tipografia
- **Font**: Inter (system-ui fallback)
- **Headings**: 600 weight
- **Body**: 400 weight
- **Scale**: 12px, 14px, 16px, 20px, 24px, 32px

### Espaçamento
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px
- Card padding: 16px
- Section gaps: 24px

### Motion
- Transitions: 150ms ease-out (hover), 200ms ease-out (modals)
- Drag feedback: scale(1.02) + shadow elevation
- Loading: skeleton pulse animation

---

## 3. Layout & Structure

### Estrutura de Páginas

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Workspace Selector | User Menu          │
├─────────────────────────────────────────────────────────┤
│  Sidebar (collapsible)  │  Main Content Area            │
│  - Dashboard            │                               │
│  - Leads (Kanban)       │                               │
│  - Campaigns            │                               │
│  - Settings             │                               │
│                         │                               │
└─────────────────────────────────────────────────────────┘
```

### Responsividade
- **Desktop (>1024px)**: Sidebar fixa + Kanban horizontal
- **Tablet (768-1024px)**: Sidebar colapsável + Kanban scroll
- **Mobile (<768px)**: Bottom nav + Kanban vertical por etapa (tabs)

### Fluxo Principal
```
Login → Workspace → Dashboard
                    ↓
              Leads (Kanban)
                    ↓
         Lead Detail → Generate Messages
                    ↓
              Send (simulated)
```

---

## 4. Features & Interactions

### 4.1 Autenticação
- **Login**: Email + senha. Link "Criar conta" para cadastro
- **Cadastro**: Nome, email, senha. Cria workspace automaticamente
- **Logout**: Confirmação antes de deslogar

### 4.2 Workspaces
- **Seletor**: Dropdown no header para trocar workspace
- **Criar**: Modal com nome do workspace
- **Membros**: Lista de membros com papel (admin/member)

### 4.3 Leads

#### Lista Kanban
- Colunas = etapas do funil
- Cards mostram: nome, empresa, responsável, dias no estágio
- Drag and drop para mover entre colunas
- Contador de leads em cada coluna

#### CRUD de Lead
- **Criar**: Slide-over/drawer da direita
- **Editar**: Click no card abre modal de edição
- **Campos padrão**:
  - Nome* (text)
  - Email (text)
  - Telefone (text)
  - Empresa (text)
  - Cargo (text)
  - Origem (select:_orgânica,indicação,linkedin,frio,outro)
  - Observações (textarea)

#### Responsável
- Dropdown com membros do workspace
- "Sem responsável" é opção válida

#### Validação de Transição
- Ao mover para etapa com campos obrigatórios
- Se incompleto: toast de erro listando campos faltantes
- Impede movimentação

### 4.4 Funil

#### Etapas Padrão (criadas no seed)
1. Base (position: 0)
2. Lead Mapeado (position: 1)
3. Tentando Contato (position: 2)
4. Conexão Iniciada (position: 3)
5. Desqualificado (position: 4)
6. Qualificado (position: 5)
7. Reunião Agendada (position: 6)

#### Configuração (Admin)
- Adicionar nova etapa
- Renomear etapa
- Reordenar (drag)
- Definir cor da etapa
- Configurar campos obrigatórios

### 4.5 Campos Personalizados

- **Criar**: Settings > Campos Personalizados > Add
- **Tipos**: Texto, Número, Data, Select (com opções)
- **Aplicar**:自动áticos para todos os leads do workspace
- **Exibir**: No formulário e cards do Kanban

### 4.6 Campanhas

#### Lista
- Cards com: nome, status (ativa/inativa), etapa gatilho
- Toggle para ativar/desativar

#### Criar/Editar
- **Nome**: Input text
- **Descrição**: Textarea
- **Contexto**:
  ```
  Textarea grande com:
  - Descrição da oferta
  - Informações do produto
  - Período/condições
  - Outras informações relevantes
  ```
- **Prompt de Geração**:
  ```
  Textarea com placeholders:
  - Persona (ex: "Consultor de vendas B2B")
  - Tom de voz (ex: "Formal mas amigável")
  - Tamanho (ex: "Máximo 150 caracteres")
  - Campos do lead para usar: {{name}}, {{company}}, {{job_title}}
  ```
- **Etapa Gatilho**: Select opcional ( vincula campanha à etapa)

### 4.7 Geração de Mensagens

#### Fluxo Manual
1. Abrir lead detail
2. Seção "Mensagens" > Selecionar Campanha (dropdown)
3. Clicar "Gerar Mensagens"
4. Exibe 2-3 variações em cards
5. Ações por mensagem:
   - Copiar (copia texto)
   - Enviar (simula + move para "Tentando Contato")
   - Regenerar (gera novas opções)

#### Geração Automática (Gatilho)
- Quando lead entra na etapa gatilho
- Gera mensagens em background
- Ao abrir lead, mensagens já disponíveis
- Badge "Mensagens pré-geradas" no card

### 4.8 Dashboard

#### Métricas
- **Total de Leads**: Número grande + variação %
- **Leads por Etapa**: Bar chart horizontal
- **Leads por Responsável**: Mini cards
- **Campanhas Ativas**: Count
- **Conversão**: Taxa de Qualified + Reunião Agendada

#### Filtros
- Período (este mês, último mês, todos)
- Responsável (dropdown)

### 4.9 Configurações

- **Geral**: Nome do workspace
- **Membros**: Lista + convite (email)
- **Funil**: Edição de etapas
- **Campos**: CRUD de campos personalizados
- **API Keys**: Chave OpenAI (opcional, pode ser global)

---

## 5. Component Inventory

### Button
- **Variants**: primary, secondary, ghost, danger
- **Sizes**: sm, md, lg
- **States**: default, hover (brightness up), active (scale 0.98), disabled (opacity 0.5), loading (spinner)

### Input
- **Types**: text, email, password, number, textarea
- **States**: default, focus (ring), error (red border + message), disabled
- **Addons**: prefix icon, suffix icon, helper text

### Select
- Custom dropdown com search
- Multi-select (para campos personalizados com opções)
- Estados: default, open, selected, disabled

### Card
- Background white, border subtle, shadow-sm
- Hover: shadow-md, scale(1.01)
- Padding: 16px

### KanbanColumn
- Header: nome + contador + cor indicator
- Body: scrollable list of LeadCards
- Footer: "Add Lead" button (opcional)

### LeadCard
- Campos principais (compactos)
- Avatar/initial do responsável (se tiver)
- Badge de mensagens pré-geradas
- Drag handle (visible on hover)

### Modal / Drawer
- Overlay: bg-black/50 backdrop-blur-sm
- Content: bg-white, rounded-xl, shadow-2xl
- Header: título + close button
- Body: scrollable
- Footer: action buttons

### Toast / Notification
- Position: bottom-right
- Types: success (green), error (red), warning (amber), info (blue)
- Auto-dismiss: 5s
- Actions: dismiss button

### Badge
- Status colors following etapa palette
- Size: sm (text-xs)

### Avatar
- Initial circle with deterministic color based on name
- Size: sm (24px), md (32px), lg (40px)

### Skeleton
- Pulse animation
- Used for: cards, table rows, text blocks

---

## 6. Technical Approach

### Frontend Stack
- **Platform**: Claude Code (Vibe Coding assistido por IA)
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand (lightweight) ou Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit (modern, accessible)
- **HTTP**: Neon JS client (@neondatabase/supabase-js)

### Backend Stack
- **Runtime**: Neon PostgreSQL + API Routes no frontend
- **Database**: Neon PostgreSQL
- **Auth**: Neon Auth (email + password) - a implementar
- **Realtime**: Neon Realtime (para updates no Kanban) - a implementar

### API Design

#### Edge Functions

**POST /generate-messages**
```typescript
// Request
{
  leadId: string,
  campaignId: string
}

// Response
{
  success: true,
  messages: [
    { id: string, text: string },
    { id: string, text: string },
    { id: string, text: string }
  ]
}
```

**POST /send-message**
```typescript
// Request
{
  leadId: string,
  campaignId: string,
  messageText: string
}

// Response
{
  success: true,
  sentAt: string,
  newEtapaId: string // "Tentando Contato"
}
```

**POST /regenerate-messages**
```typescript
// Request
{
  leadId: string,
  campaignId: string,
  reason?: string // optional feedback
}
```

#### Database Triggers

**auto_generate_on_etapa_change**
- Fires AFTER UPDATE on leads.current_etapa_id
- Checks if new etapa has campaigns with trigger
- Creates lead_messages records with status 'pending'

### Data Model

See: `docs/DatabaseSchema.md`

### Authentication Flow
1. User signs up → Neon Auth creates user entry
2. Application creates user_profiles entry
3. On first login, prompt to create workspace
4. Creator becomes admin of workspace

### Environment Variables
```
NEON_DATABASE_URL=
NEON_AUTH_TOKEN=
OPENROUTER_API_KEY=
```

---

## 7. Edge Cases & Error Handling

### Campos Obrigatórios
- Ao mover lead para etapa com campos obrigatórios vazios
- Toast de erro listando campos: "Preencha os campos obrigatórios: Cargo, Telefone"
- Lead permance na etapa atual

### Campos Personalizados
- Ao deletar campo personalizado:
  - Confirmar com modal
  - Não deletar valores existentes (soft delete ou manter)
- Ao renomear: update em custom_fields e leads

### Geração de Mensagens
- Se API da OpenAI falhar: toast de erro, opção de retry
- Se lead incompleto (faltam dados para o prompt): aviso antes de gerar
- Rate limiting: cooldown de 5s entre gerações

### Autenticação
- Sessão expirada: redirect para login com mensagem
- Acesso à workspace que não é membro: redirect para dashboard com erro

### Concurrent Updates
- Kanban: usar Realtime para sincronizar
- Optimistic updates com rollback em caso de erro

---

## 8. Future Considerations (Não no MVP)

- Bulk actions (mover múltiplos leads)
- Import/Export de leads (CSV)
- Email integration (simulated send → webhook)
- Notificações Push
- Analytics Avançado
- API pública para integrações
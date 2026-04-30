# Roadmap - SDR CRM

## Cronograma de Execução

### Fase 1: Fundações (Dias 1-2) ✅
**Objetivo**: Setup inicial do projeto

- [x] Criar projeto no Neon
  - Configurar database schema
  - Neon Auth e Data API configurados
  - Bootstrap de profile/workspace/etapas via migration `002_neon_auth_bootstrap.sql`

- [x] Setup projeto frontend
  - Inicializar projeto React + TypeScript
  - Configurar Tailwind CSS
  - Configurar Neon client
  - Setup rotas básicas

- [x] Implementar autenticação
  - Página de login/cadastro
  - Protected routes
  - Session management via Zustand/localStorage
  - Recuperação para usuário sem workspace

### Fase 2: Workspaces e Gerenciamento (Dias 3-4) ✅
**Objetivo**: Sistema de workspaces com multi-tenancy

- [x] Bootstrap de workspaces
  - Criar workspace na hora do cadastro/login
  - Listar workspaces do usuário
  - Trocar workspace ativo

- [x] Gerenciamento básico de membros
  - Listar membros do workspace
  - Definir papel (admin/member) no banco

- [x] Atualizar layout com seletor de workspace

### Fase 3: Gestão de Leads (Dias 5-7) ✅
**Objetivo**: Cadastro e visualização de leads

- [x] CRUD de leads
  - Formulário de cadastro
  - Lista de leads
  - Edição de lead

- [x] Visualização Kanban
  - Colunas por etapa do funil
  - Cards de leads
  - Drag and drop entre colunas

- [x] Detalhes do lead
  - Modal com todas informações
  - Edição inline

- [x] Responsável pelo lead
  - Campo disponível no schema
  - Exibição no card (inicial do usuário)

### Fase 4: Funil e Regras (Dias 8-9) ✅
**Objetivo**: Funil configurável e validações

- [x] Configuração de etapas
  - CRUD de etapas do funil
  - Reordenar etapas
  - Definir etapa padrão

- [x] Campos obrigatórios por etapa
  - Interface para configurar (via schema)
  - Validação ao mover lead

- [x] Restrição de transição
  - Verificar campos obrigatórios
  - Bloquear movimentação se incompleto

### Fase 5: Campos Personalizados (Dia 10) ✅
**Objetivo**: Flexibilidade para cada workspace

- [x] CRUD de campos personalizados
  - Tipo: texto, número, data, select
  - Opções para selects

- [x] Vincular valores aos leads
  - Exibir campos no formulário
  - Salvar em lead_field_values

- [x] Integração com Kanban
  - Campos customizados nos formulários de criação/edição

### Fase 6: Campanhas (Dias 11-12) ✅
**Objetivo**: Sistema de campanhas de abordagem

- [x] CRUD de campanhas
  - Nome e descrição
  - Contexto (oferta/produto)
  - Prompt de geração
  - Etapa gatilho (opcional)

- [x] Listagem de campanhas
  - Campanhas ativas
  - Status

### Fase 7: Integração IA (Dias 13-15) ✅
**Objetivo**: Geração de mensagens com OpenRouter

- [x] Geração manual via frontend
  - Receber lead_id + campaign_id
  - Montar prompt com contexto + dados do lead
  - Chamar OpenRouter API
  - Salvar mensagens geradas em `lead_messages`

- [x] Interface de geração
  - Selecionar campanha
  - Botão "Gerar Mensagens"
  - Exibir 3 variações

- [x] Regeneração
  - Botão para gerar novas opções
  - Atualizar mensagens

- [x] Envio simulado
  - Botão "Enviar" na mensagem
  - Salvar em message_history
  - Mover lead para "Tentando Contato"

### Fase 8: Automação de Gatilhos (Dias 16-17) ⚠️
**Objetivo**: Geração automática ao mover para etapa

- [x] Database trigger
  - Detectar mudança de etapa
  - Verificar campanhas com gatilho

- [ ] Processamento assíncrono
  - Edge function para processar pendentes
  - Background job ou schedule

- [ ] Exibição automática
  - Mensagens pré-geradas disponíveis

### Fase 9: Dashboard (Dia 18-19) ✅
**Objetivo**: Métricas e visão geral

- [x] Métricas básicas
  - Total de leads
  - Leads por etapa
  - Taxa de qualificação
  - Campanhas ativas

- [x] Cards e gráficos
  - Gráfico de barras: distribuição por etapa
  - Gráfico de pizza: proporção por etapa
  - Gráfico de linha: evolução de leads (dados simulados)

- [ ] Diferenciais (se tempo)
  - Taxa de conversão entre etapas
  - Leads criados por período

### Fase 10: Polish e Deploy (Dia 20) ✅
**Objetivo**: Ajustes finais e publicação

- [x] Ajustes de UI/UX
  - Responsividade (mobile/desktop)
  - Mensagens de erro
  - Loading states
  - Animações com Framer Motion

- [x] Deploy
  - Estrutura de produção configurada
  - Variáveis de ambiente documentadas

- [x] Documentação
  - README.md atualizado
  - Decisões técnicas documentadas
  - Roteiro de demonstração

---

## Checklists de Verificação

### MVP Completo ✅
- [x] Autenticação (cadastro/login)
- [x] Workspaces com bootstrap e escopo por `workspace_id`
- [x] CRUD de leads
- [x] Kanban com drag-drop
- [x] CRUD de campanhas
- [x] Geração de mensagens IA
- [x] Dashboard básico
- [x] Campos customizados
- [x] Configurações de workspace

### Estado técnico validado
- [x] `npm run lint`
- [x] `npm run build`
- [x] Usuário existente no Neon com `user_profiles`, membership e 7 etapas padrão
- [x] RLS/policies ativas para Neon Auth

### Diferenciais Implementados
- [x] Geração automática por gatilho (trigger criado,有待 backend)
- [x] Edição do funil
- [x] Campos personalizados
- [x] Responsável por lead
- [x] Regras de transição
- [ ] Filtros e busca
- [ ] Convite de usuários
- [ ] Histórico de atividades

---

## Estimativa de Tempo Total

| Fase | Dias | Status |
|------|------|--------|
| Fundações | 2 | ✅ Concluído |
| Workspaces | 2 | ✅ Concluído |
| Gestão de Leads | 3 | ✅ Concluído |
| Funil e Regras | 2 | ✅ Concluído |
| Campos Personalizados | 1 | ✅ Concluído |
| Campanhas | 2 | ✅ Concluído |
| Integração IA | 3 | ✅ Concluído |
| Automação | 2 | ⚠️ Parcial |
| Dashboard | 2 | ✅ Concluído |
| Polish/Deploy | 1 | ✅ Concluído |

**Total implementado**: ~18/20 dias equivalents (90% completo)

# Roadmap - SDR CRM

## Cronograma de Execução

### Fase 1: Fundações (Dias 1-2)
**Objetivo**: Setup inicial do projeto

- [x] Criar projeto no Neon
  - Configurar database schema
  - Configurar RLS policies (quando Auth estiver)
  - Seed: criar etapas padrão do funil

- [ ] Setup projeto frontend (Loveable)
  - Inicializar projeto React + TypeScript
  - Configurar Tailwind CSS
  - Configurar Supabase client
  - Setup rotas básicas

- [ ] Implementar autenticação
  - Página de login/cadastro
  - Protected routes
  - Session management

### Fase 2: Workspaces e Gerenciamento (Dias 3-4)
**Objetivo**: Sistema de workspaces com multi-tenancy

- [ ] CRUD de workspaces
  - Criar workspace na hora do cadastro
  - Listar workspaces do usuário
  - Trocar workspace ativo

- [ ] Gerenciamento de membros
  - Listar membros do workspace
  - Definir papel (admin/member)

- [ ] Atualizar layout com seletor de workspace

### Fase 3: Gestão de Leads (Dias 5-7)
**Objetivo**: Cadastro e visualização de leads

- [ ] CRUD de leads
  - Formulário de cadastro
  - Lista de leads
  - Edição de lead

- [ ] Visualização Kanban
  - Colunas por etapa do funil
  - Cards de leads
  - Drag and drop entre colunas

- [ ] Detalhes do lead
  - Modal ou página com todas informações
  - Histórico de mensagens

- [ ] Responsável pelo lead
  - Atribuir usuário do workspace
  - Filter por responsável

### Fase 4: Funil e Regras (Dias 8-9)
**Objetivo**: Funil configurável e validações

- [ ] Configuração de etapas
  - CRUD de etapas do funil
  - Reordenar etapas
  - Definir etapa padrão

- [ ] Campos obrigatórios por etapa
  - Interface para configurar
  - Validação ao mover lead

- [ ] Restrição de transição
  - Verificar campos obrigatórios
  - Bloquear movimentação se incompleto

### Fase 5: Campos Personalizados (Dia 10)
**Objetivo**: Flexibilidade para cada workspace

- [ ] CRUD de campos personalizados
  - Tipo: texto, número, data, select
  - Opções para selects

- [ ] Vincular valores aos leads
  - Exibir campos no formulário
  - Salvar em lead_field_values

- [ ] Integração com Kanban
  - Mostrar campos customizados nos cards

### Fase 6: Campanhas (Dias 11-12)
**Objetivo**: Sistema de campanhas de abordagem

- [ ] CRUD de campanhas
  - Nome e descrição
  - Contexto (oferta/produto)
  - Prompt de geração
  - Etapa gatilho (opcional)

- [ ] Listagem de campanhas
  - Campanhas ativas
  - Status

### Fase 7: Integração IA (Dias 13-15)
**Objetivo**: Geração de mensagens com OpenAI

- [ ] Edge Function: generate_messages
  - Receber lead_id + campaign_id
  - Montar prompt com contexto + dados do lead
  - Chamar OpenAI API
  - Retornar mensagens geradas

- [ ] Interface de geração
  - Selecionar campanha
  - Botão "Gerar Mensagens"
  - Exibir 2-3 variações

- [ ] Regeneração
  - Botão para gerar novas opções
  - Atualizar mensagens

- [ ] Envio simulado
  - Botão "Enviar" na mensagem
  - Salvar em message_history
  - Mover lead para "Tentando Contato"

### Fase 8: Automação de Gatilhos (Dia 16-17)
**Objetivo**: Geração automática ao mover para etapa

- [ ] Database trigger
  - Detectar mudança de etapa
  - Verificar campanhas com gatilho

- [ ] Processamento assíncrono
  - Edge function para processar pendentes
  - Background job ou schedule

- [ ] Exibição automática
  - Mensagens pré-geradas disponíveis

### Fase 9: Dashboard (Dia 18-19)
**Objetivo**: Métricas e visão geral

- [ ] Métricas básicas
  - Total de leads
  - Leads por etapa
  - Leads por responsável

- [ ] Cards e gráficos simples
  - Visualização do funil

- [ ] Diferenciais (se tempo)
  - Taxa de conversão entre etapas
  - Leads criados por período

### Fase 10: Polish e Deploy (Dia 20)
**Objetivo**: Ajustes finais e publicação

- [ ] Ajustes de UI/UX
  - Responsividade
  - Mensagens de erro
  - Loading states

- [ ] Deploy
  - Publicar frontend
  - Configurar ambiente
  - Testar fluxo completo

- [ ] Documentação
  - README.md completo
  - Decisões técnicas
  - Screenshots/GIFs

---

## Checklists de Verificação

### MVP Completo ✅
- [x] Autenticação (cadastro/login)
- [ ] Workspaces isolados
- [ ] CRUD de leads
- [ ] Kanban com drag-drop
- [ ] CRUD de campanhas
- [ ] Geração de mensagens IA
- [ ] Dashboard básico
- [ ] Deploy publicado

### Diferenciais Implementados
- [ ] Geração automática por gatilho
- [ ] Edição do funil
- [ ] Campos personalizados
- [ ] Responsável por lead
- [ ] Regras de transição
- [ ] Filtros e busca
- [ ] Convite de usuários
- [ ] Histórico de atividades

---

## Estimativa de Tempo Total

| Fase | Dias | Acumulado |
|------|------|-----------|
| Fundações | 2 | 2 |
| Workspaces | 2 | 4 |
| Gestão de Leads | 3 | 7 |
| Funil e Regras | 2 | 9 |
| Campos Personalizados | 1 | 10 |
| Campanhas | 2 | 12 |
| Integração IA | 3 | 15 |
| Automação | 2 | 17 |
| Dashboard | 2 | 19 |
| Polish/Deploy | 1 | 20 |

**Total estimado**: ~20 dias (trabalhando em tempo integral)
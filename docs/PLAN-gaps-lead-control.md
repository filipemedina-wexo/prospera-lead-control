# PLAN — Gaps: Prospera Lead Control

> Base: Auditoria 24/02/2026 · 13 gaps divididos em 3 fases

---

## 🎯 Objetivo

Fechar os gaps críticos e importantes sem quebrar o design e comportamento existentes.
Todos os dados continuam mockados (sem Supabase nesta sprint).

---

## 🔴 FASE 1 — Críticos

### T1.1 · Dashboard Corretor próprio
**Arquivo:** `src/pages/corretor/DashboardCorretor.tsx` *[NOVO]*

- [ ] Criar `DashboardCorretor.tsx` com:
  - Hero: nome do corretor (João Mendes), pontos XP, nível
  - KPIs pessoais: Leads ativos, SLA médio pessoal, Visitas marcadas, Taxa conversão
  - `CampaignWidget` (campanha ativa com progresso de pontos)
  - `SmartSuggestions` (ações prioritárias sugeridas)
  - `PriorityLeadList` (leads que precisam de atenção urgente)
  - Mini-agenda: visitas do dia/semana (leads com `dataVisita`)
- [ ] `App.tsx`: substituir `case 'dashboard': return <Dashboard />` → `return <DashboardCorretor />` no bloco `profile === 'corretor'`
- [ ] Remover import do `Dashboard.tsx` genérico no bloco corretor
- ✅ **Verificar:** Trocar para perfil "Corretor" → ver dashboard com nome, XP, CampaignWidget e lista de leads urgentes

---

### T1.2 · Kanban em LeadsImobiliaria
**Arquivo:** `src/pages/imobiliaria/LeadsImobiliaria.tsx` *[MODIFICAR]*

- [ ] Toggle Lista ↔ Kanban com ícones `LayoutList` / `LayoutKanban` (lucide)
- [ ] Integrar `<KanbanBoard>` passando leads filtrados por `IMOB_ID` agrupados por status
- [ ] `KanbanCard.tsx`: exibir nome do lead, empreendimento, corretor e `StatusBadge`
- [ ] Ao clicar no card → abrir `LeadDrawer` (criado em T2.1)
- ✅ **Verificar:** Perfil "Imobiliária" → Leads → clicar ícone Kanban → colunas aparecem com cards por status

---

## 🟡 FASE 2 — Importantes

### T2.1 · LeadDrawer (visualização rápida de lead)
**Arquivo:** `src/components/ui/LeadDrawer.tsx` *[NOVO]*

- [ ] Drawer lateral deslizante com overlay escuro
- [ ] Props: `leadId: string | null`, `onClose: () => void`
- [ ] Conteúdo: Info (nome, telefone, empreendimento, status badge), `Timeline` com histórico
- [ ] Modo somente leitura (sem botões de mudança de status — apenas para gerentes)
- [ ] Usado em: `LeadsImobiliaria`, `LeadsIncorporadora`, `KanbanBoard` (T1.2)
- ✅ **Verificar:** Perfil "Imobiliária" → clicar em qualquer lead na lista → drawer desliza da direita com dados e histórico

---

### T2.2 · Filtros nas listagens de Leads
**Arquivos:** `LeadsImobiliaria.tsx`, `LeadsIncorporadora.tsx` *[MODIFICAR]*

- [ ] Barra de filtros acima da lista:
  - Input busca por nome ou telefone
  - Chips clicáveis de status (Novo, Contatado, Visita, Proposta, Venda, Perdido)
  - Dropdown de empreendimento
  - (Incorporadora) Dropdown de imobiliária
- [ ] Lógica local com `useState` derivando `filteredLeads` do array mockado
- ✅ **Verificar:** Digitar "Fer" → filtra para "Fernanda Alves"; clicar chip "Novo" → só leads novos

---

### T2.3 · Notificações para Imobiliária
**Arquivo:** `src/components/layout/Layout.tsx` *[MODIFICAR]*

- [ ] Ampliar `NotificationDropdown` para perfil `imobiliaria`:
  - Leads novos sem atendimento há mais de 30 min
  - Alertas de SLA estourado da equipe
- [ ] Badge no sino do header quando perfil é imobiliária
- ✅ **Verificar:** Perfil "Imobiliária" → badge aparece no sino → dropdown lista alertas de SLA

---

### T2.4 · Página de Configurações funcional
**Arquivo:** `src/pages/Configuracoes.tsx` *[NOVO]*

- [ ] Abas: Meu Perfil | Metas | Notificações
- [ ] **Meu Perfil**: nome, email, cargo (campos editáveis localmente)
- [ ] **Metas**: SLA máximo (min), meta de visitas/mês, meta de conversão % (inputs numéricos)
- [ ] **Notificações**: toggles para tipo de alerta (novo lead, SLA estourado, visita do dia)
- [ ] `App.tsx`: registrar no `case 'configuracoes'` de todos os perfis
- ✅ **Verificar:** Qualquer perfil → Configurações → abas renderizam sem crash; editar campo nome → persiste no estado local

---

## 🟢 FASE 3 — Nice-to-have

### T3.1 · Busca global funcional
**Arquivo:** `Layout.tsx` *[MODIFICAR]*

- [ ] Substituir `<span>Buscar...</span>` por `<input>` com `useState`
- [ ] Dropdown de resultados: leads (nome/telefone), empreendimentos, corretores
- [ ] Clicar em resultado → navegar via `setCurrentPage` + `setSelectedLeadId`
- ✅ **Verificar:** Digitar "Aurora" → dropdown mostra "Residencial Aurora"; clicar → navega

---

### T3.2 · CRUD de Empreendimentos
**Arquivos:** `Empreendimentos.tsx`, `EmpreendimentosImobiliaria.tsx` *[MODIFICAR]*

- [ ] Botão "Novo Empreendimento" → modal com campos: Nome, Cidade, Status Obra, Entrega
- [ ] Botão editar no card → modal preenchido
- [ ] Salvar no mock array via `useState` local (não persiste entre reload)
- ✅ **Verificar:** Criar empreendimento → aparece na lista; editar → campos preenchidos

---

### T3.3 · CRUD de Imobiliárias
**Arquivo:** `Imobiliarias.tsx` *[MODIFICAR]*

- [ ] Modal simples: Nome, Cidade
- [ ] Botão de editar por linha da tabela
- ✅ **Verificar:** Adicionar "Imob Teste" → aparece na lista

---

## 📐 Ordem de Execução Recomendada

```
T2.1 (LeadDrawer)  →  T1.1 (Dashboard Corretor)  →  T1.2 (Kanban)
     ↓
T2.2 (Filtros)  →  T2.3 (Notif Imob)  →  T2.4 (Configurações)
     ↓
T3.1 → T3.2 → T3.3
```

> T2.1 vem antes porque T1.2 (Kanban) depende do drawer para o click no card.

---

## ✅ Done When

- [ ] Corretor → dashboard próprio (sem Dashboard.tsx genérico)
- [ ] Imobiliária → Leads tem toggle Kanban funcionando
- [ ] Qualquer lead é clicável e abre drawer com histórico
- [ ] Filtros de nome/status funcionam nas listas de leads
- [ ] Configurações não é mais placeholder
- [ ] Troca de perfil via ProfileSwitcher não quebra nenhuma página

---

## 🚫 Fora do Escopo

- Integração com Supabase / banco real
- Autenticação real
- Mobile responsivo extra além do que já existe

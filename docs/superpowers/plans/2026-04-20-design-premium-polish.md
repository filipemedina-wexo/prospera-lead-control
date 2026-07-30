# Design Premium Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar a qualidade visual do Prospera Lead Control para sentir premium, corrigindo problemas de acessibilidade e polindo a camada de design system sem alterar lógica de negócio.

**Architecture:** Todas as mudanças são isoladas à camada de design system — tokens CSS, componentes atômicos (Button, Card) e layout compartilhado (Sidebar, Layout). Nenhuma mudança em páginas ou lógica de negócio. Cada tarefa é independentemente committable.

**Tech Stack:** React 19, TailwindCSS v4 (`@theme` block em `src/index.css`), Inter (Google Fonts), Lucide React

---

## File Map

| File | Tipo | O que muda |
|------|------|-----------|
| `src/index.css` | Modify | Import Inter via Google Fonts, corrigir contraste `--color-text-muted`, adicionar tokens de shadow |
| `src/components/ui/Button.tsx` | Modify | Primary com gradient + shadow + hover lift; Secondary com bg-white + hover border |
| `src/components/ui/Card.tsx` | Modify | Adicionar prop `size` ("sm"\|"md"\|"lg") sem quebrar uso existente |
| `src/components/layout/Sidebar.tsx` | Modify | Active state com left bar indicator + remover dot indicator |
| `src/components/layout/Layout.tsx` | Modify | `animate-bounce` → `animate-pulse`; `text-[10px]` → `text-xs` em 5 ocorrências |

---

## Task 1: Font Loading & Color Token Fixes

> Corrige carregamento da fonte Inter (atualmente usando fallback do SO), melhora contraste do texto muted para passar WCAG AA, e adiciona escala de shadow.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Ler o arquivo atual**

```bash
# Confirmar estado antes de editar
cat src/index.css
```

- [ ] **Step 2: Substituir o conteúdo de `src/index.css`**

Substituir o bloco `@import "tailwindcss";` e `@theme {}` pelo seguinte (mantendo todas as outras regras):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --color-brand: #22C55E;
  --color-brand-accent: #16A34A;
  --color-bg: #F8FAFC;
  --color-bg-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;        /* era #94A3B8 (ratio 3.1:1) → agora slate-500 (ratio 5.9:1, passa WCAG AA) */

  --font-sans: 'Inter', system-ui, sans-serif;

  --radius-xl: 24px;
  --radius-md: 8px;

  /* Shadow scale */
  --shadow-sm: 0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 40px -4px rgba(0,0,0,0.10), 0 4px 12px -4px rgba(0,0,0,0.06);
}
```

O restante do arquivo (`body {}`, scrollbar, `.glass`, `.glow-text`) permanece inalterado.

- [ ] **Step 3: Verificar no browser**

```bash
npm run dev
```

Abrir `http://localhost:5173`. Verificar que:
- A fonte Inter está carregando (em DevTools → Network → filtrar por "fonts" — deve aparecer Inter)
- Textos secundários (ex: labels de KPI card "Leads Ativos") ficaram levemente mais escuros e legíveis
- Layout geral não quebrou

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "design: fix Inter font loading, improve muted text contrast to WCAG AA, add shadow tokens"
```

---

## Task 2: Button Component Enhancement

> Eleva o botão primary com gradient, shadow e micro-interação hover. Melhora o secondary com fundo branco e borda responsiva.

**Files:**
- Modify: `src/components/ui/Button.tsx`

- [ ] **Step 1: Ler o arquivo atual**

```bash
cat src/components/ui/Button.tsx
```

- [ ] **Step 2: Substituir o conteúdo de `src/components/ui/Button.tsx`**

```tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                    {
                        // Primary: gradient + shadow + hover lift + active reset
                        'bg-gradient-to-b from-brand to-brand-accent text-white shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/25 hover:-translate-y-px active:translate-y-0 active:shadow-sm': variant === 'primary',
                        // Secondary: white bg + subtle border + hover brand tint
                        'bg-white border border-border text-text-primary hover:border-brand/30 hover:shadow-sm': variant === 'secondary',
                        // Ghost: unchanged
                        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-black/5': variant === 'ghost',
                    },
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
```

- [ ] **Step 3: Verificar no browser**

Com o dev server rodando, navegar para a página de Login (`/`) e para qualquer dashboard. Verificar:
- Botão "Entrar" da tela de login tem gradiente verde visível e levanta sutilmente no hover
- Botões secondary (se visíveis) têm fundo branco
- Botão ghost (menu/notificações no header) não mudou visualmente

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "design: elevate Button primary with gradient, shadow and hover lift micro-interaction"
```

---

## Task 3: Card Size Variants

> Adiciona prop `size` ao Card para permitir padding compacto/espaçoso sem quebrar uso existente (que já sobrescreve via `className="p-4"`).

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Context:** O Card tem default `p-8` mas os dashboards já sobrescrevem com `className="p-4"` ou `className="p-5"`. Esta tarefa adiciona uma API mais limpa via prop, tornando o padrão `p-6` (médio) e documentando os tamanhos. O default muda de `p-8` para `p-6` — código existente que passa `className="p-4"` ou `className="p-5"` não é afetado pois `className` tem precedência sobre as classes da prop.

- [ ] **Step 1: Ler o arquivo atual**

```bash
cat src/components/ui/Card.tsx
```

- [ ] **Step 2: Substituir o conteúdo de `src/components/ui/Card.tsx`**

```tsx
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'hover';
    size?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative rounded-xl border border-white/50 bg-white/70 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300',
                    {
                        'p-4': size === 'sm',
                        'p-6': size === 'md',
                        'p-8': size === 'lg',
                    },
                    {
                        'hover:bg-white/90 hover:border-white/80 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]': variant === 'hover',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
```

- [ ] **Step 3: Verificar no browser**

Navegar pelo dashboard. Os cards que passam `className="p-4"` ou `className="p-5"` devem continuar com seu padding (className sobrescreve). Cards sem className devem agora ter `p-6` (era `p-8`).

Verificar que nenhum layout quebrou — se algum card ficou muito compacto, identificar o arquivo e adicionar `size="lg"` explicitamente naquele uso.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "design: add size variants to Card (sm/md/lg), default changes p-8 → p-6"
```

---

## Task 4: Sidebar Active State — Left Bar Indicator

> Substitui o active state fraco (`bg-brand/10` + dot) por um padrão premium de barra lateral esquerda + fundo mais definido.

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Ler o arquivo atual**

```bash
cat src/components/layout/Sidebar.tsx
```

- [ ] **Step 2: Localizar o bloco do nav item e substituí-lo**

Dentro do `items.map((item) => { ... })`, substituir o `<button>` e seu conteúdo interno pelo seguinte:

```tsx
<button
    key={item.id}
    onClick={() => handleNavClick(item.id)}
    className={cn(
        'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer overflow-hidden',
        isActive
            ? 'bg-brand/10 text-brand'
            : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
    )}
>
    {/* Left bar indicator — only on active */}
    {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand rounded-r-full" />
    )}

    <Icon
        size={20}
        className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-brand' : 'text-text-muted group-hover:text-text-primary'
        )}
    />
    {/* On mobile always show label; on desktop respect collapsed state */}
    <span className={cn('truncate', collapsed ? 'md:hidden' : '')}>
        {item.label}
    </span>
    {/* Dot indicator removed — replaced by left bar above */}
</button>
```

**Nota:** O `{isActive && <div className="ml-auto w-1.5 h-1.5 ..." />}` (dot antigo) deve ser removido completamente — ele está incluído na substituição acima (já não aparece).

- [ ] **Step 3: Verificar no browser**

Navegar entre as páginas do dashboard. Verificar:
- Item ativo tem uma barra fina verde na borda esquerda
- Fundo `bg-brand/10` permanece
- Modo collapsed (desktop): clicar em "Recolher" e verificar que o item ativo ainda mostra a barra lateral
- Mobile: abrir drawer e verificar active state

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "design: replace sidebar active dot with left bar indicator for premium nav style"
```

---

## Task 5: Layout Header — Acessibilidade e Animação

> Corrige 5 ocorrências de texto sub-12px (viola legibilidade mínima) e substitui `animate-bounce` do badge de notificações por `animate-pulse`.

**Files:**
- Modify: `src/components/layout/Layout.tsx`

- [ ] **Step 1: Ler o arquivo atual**

```bash
cat src/components/layout/Layout.tsx
```

- [ ] **Step 2: Corrigir `animate-bounce` → `animate-pulse` no badge de notificações**

Localizar (aprox. linha 165):
```tsx
<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm animate-bounce">
```

Substituir por:
```tsx
<span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1 shadow-sm animate-pulse">
```

*(Também muda `text-[10px]` → `text-xs` aqui)*

- [ ] **Step 3: Corrigir textos sub-12px no `NotificationDropdown`**

Localizar (aprox. linha 67) — header do dropdown:
```tsx
<span className="text-[11px] text-brand font-medium">
```
Substituir por:
```tsx
<span className="text-xs text-brand font-medium">
```

Localizar (aprox. linha 96) — timestamp das notificações:
```tsx
<span className="text-[11px] text-text-muted shrink-0">{notif.time}</span>
```
Substituir por:
```tsx
<span className="text-xs text-text-muted shrink-0">{notif.time}</span>
```

- [ ] **Step 4: Corrigir textos sub-12px no Avatar Popover**

Localizar (aprox. linhas 213, 219, 221, 225) — labels do popover:

```tsx
<p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Top Performance</p>
```
→
```tsx
<p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Top Performance</p>
```

```tsx
<p className="text-[10px] text-slate-400">Meta Semanal</p>
```
→
```tsx
<p className="text-xs text-slate-400">Meta Semanal</p>
```

```tsx
<p className="text-[10px] text-slate-400">Pontos XP</p>
```
→
```tsx
<p className="text-xs text-slate-400">Pontos XP</p>
```

```tsx
<span className="text-[10px] text-slate-400">Ranking Geral</span>
```
→
```tsx
<span className="text-xs text-slate-400">Ranking Geral</span>
```

- [ ] **Step 5: Verificar no browser**

1. Verificar que o badge de notificação pisca suavemente (pulse) em vez de saltar (bounce)
2. Abrir o dropdown de notificações — textos de timestamp e contador devem ser legíveis
3. Hover no avatar — popover deve aparecer com labels legíveis em `text-xs`
4. Nenhum layout quebrado

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Layout.tsx
git commit -m "design: fix notification badge bounce->pulse, fix 5 sub-12px text violations for accessibility"
```

---

---

## Task 6: Corretor Views — Layout, Hierarquia e Consistência

> A view do corretor tem três problemas principais: (1) DashboardCorretor em coluna única em desktop com CampaignWidget quebrando o fluxo de informação, (2) MeusLeads como lista flat sem agrupamento por status, (3) LeadDetalhe com botões de ação usando estilos inline inconsistentes e mais 6 ocorrências de `text-[10px]`.

**Files:**
- Modify: `src/pages/corretor/DashboardCorretor.tsx`
- Modify: `src/pages/corretor/MeusLeads.tsx`
- Modify: `src/pages/corretor/LeadDetalhe.tsx`

---

### Task 6a: DashboardCorretor — Layout 2 Colunas + Hero Gradient Fix

**Problema:** Em desktop, tudo empilhado numa coluna longa. O CampaignWidget aparece no meio dos KPIs quebrando o raciocínio. O gradient do hero (`from-brand to-brand/70`) fica desbotado pois termina em verde transparente sobre fundo branco.

- [ ] **Step 1: Ler o arquivo**

```bash
cat src/pages/corretor/DashboardCorretor.tsx
```

- [ ] **Step 2: Corrigir o gradient do hero (linha ~64)**

Localizar:
```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand/70 p-6 text-white shadow-lg">
```

Substituir por:
```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-accent via-brand to-emerald-400 p-6 text-white shadow-lg shadow-brand/20">
```

- [ ] **Step 3: Reestruturar o layout do return em 2 colunas para desktop**

Substituir o `return (...)` do componente — o bloco completo de JSX a partir da `<div className="space-y-6">` — pelo seguinte:

```tsx
return (
    <div className="space-y-6">
        {/* Hero de boas-vindas */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-accent via-brand to-emerald-400 p-6 text-white shadow-lg shadow-brand/20">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-white/70 text-sm font-medium">Bem-vindo de volta 👋</p>
                    <h1 className="text-2xl font-bold mt-0.5">{corretor?.nome ?? 'Corretor'}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Star size={14} className={nivelColor} fill="currentColor" />
                        <span className={`text-sm font-semibold ${nivelColor}`}>Nível {nivel}</span>
                        <span className="text-white/50">·</span>
                        <span className="text-sm text-white/80">{pontos} pts</span>
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-xs text-white/60 mb-1">Progresso para próximo nível</div>
                    <div className="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-700"
                            style={{ width: `${progressoNivel}%` }}
                        />
                    </div>
                    <div className="text-xs text-white/60 mt-1">{pontos}/{proximoNivel} pts</div>
                </div>
            </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Leads Ativos</p>
                    <Zap size={16} className="text-brand" />
                </div>
                <p className="text-3xl font-light">{leadsAtivos}</p>
                <p className="text-xs text-text-muted mt-1">em atendimento</p>
            </Card>
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">SLA Médio</p>
                    <Clock size={16} className={slaMediaMin > 10 ? 'text-red-500' : 'text-green-500'} />
                </div>
                <p className={`text-3xl font-light ${slaMediaMin > 10 ? 'text-red-500' : ''}`}>{slaMediaMin}m</p>
                <p className={`text-xs mt-1 ${slaEstourados > 0 ? 'text-red-400' : 'text-text-muted'}`}>
                    {slaEstourados > 0 ? `${slaEstourados} SLA estourado${slaEstourados > 1 ? 's' : ''}` : 'Dentro do limite'}
                </p>
            </Card>
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Visitas Marcadas</p>
                    <Calendar size={16} className="text-violet-500" />
                </div>
                <p className="text-3xl font-light">{visitasMarcadas}</p>
                <p className="text-xs text-text-muted mt-1">{visitasHoje.length > 0 ? `${visitasHoje.length} hoje` : 'nenhuma hoje'}</p>
            </Card>
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Taxa de Conversão</p>
                    <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-3xl font-light">{taxaConversao}%</p>
                <p className="text-xs text-text-muted mt-1">{vendas} venda{vendas !== 1 ? 's' : ''} no período</p>
            </Card>
        </div>

        {/* Corpo 2 colunas em desktop */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

            {/* Coluna principal (2/3): ações e leads */}
            <div className="lg:col-span-2 space-y-6">
                {/* Leads Prioritários */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={18} className="text-red-500" />
                        <h3 className="font-semibold text-base">Leads que Precisam de Atenção</h3>
                    </div>
                    <PriorityLeadList />
                </div>

                {/* Meta Semanal */}
                <Card className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={18} className="text-brand" />
                        <h3 className="font-semibold text-base">Meta Semanal</h3>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-muted">Progresso</span>
                        <span className="font-bold text-brand">{performanceMetas.weeklyGoal}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand to-brand/70 rounded-full transition-all duration-700"
                            style={{ width: `${performanceMetas.weeklyGoal}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-text-muted">
                        <span>{performanceMetas.tasksCompleted} tarefas completas</span>
                        <span>{performanceMetas.tasksPending} pendentes</span>
                    </div>
                </Card>
            </div>

            {/* Coluna lateral (1/3): campanha, visitas e sugestões */}
            <div className="space-y-6">
                {/* Campanha Ativa */}
                <CampaignWidget
                    campanha={campanhaMock}
                    currentPontos={pontos}
                    enterpriseName="Residencial Aurora"
                    developerName="Construtora Horizonte"
                />

                {/* Visitas de Hoje */}
                {visitasHoje.length > 0 && (
                    <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={18} className="text-violet-500" />
                            <h3 className="font-semibold text-base">Visitas de Hoje</h3>
                            <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-full">{visitasHoje.length}</span>
                        </div>
                        <div className="space-y-3">
                            {visitasHoje.map(lead => (
                                <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                                            {lead.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{lead.nome}</p>
                                            <p className="text-xs text-text-muted">
                                                {lead.dataVisita ? new Date(lead.dataVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Sugestões inteligentes */}
                <SmartSuggestions suggestions={smartSuggestions} />
            </div>
        </div>
    </div>
);
```

**Nota:** O import de `Star` já existe. Verifique que todos os imports (`Target`, `AlertCircle`, `Calendar`, `Zap`, `Clock`, `TrendingUp`, `Star`) estão presentes no topo do arquivo — não adicionar duplicatas.

- [ ] **Step 4: Verificar no browser**

1. Em desktop (≥1024px): layout deve ter 2 colunas — KPIs full-width no topo, depois coluna principal à esquerda (Leads Prioritários + Meta Semanal) e coluna lateral à direita (Campanha + Visitas + Sugestões)
2. Em mobile: tudo empilhado normalmente
3. O hero deve ter um gradiente rico de verde escuro para verde claro
4. Os números dos KPIs devem aparecer em `font-light` (mais finos, mais premium)

- [ ] **Step 5: Commit**

```bash
git add src/pages/corretor/DashboardCorretor.tsx
git commit -m "design: corretor dashboard 2-column desktop layout, richer hero gradient, font-light KPI numbers"
```

---

### Task 6b: MeusLeads — Agrupamento por Status com Contadores

**Problema:** A lista de leads é flat, sem qualquer agrupamento. O corretor não consegue ver rapidamente quantos leads estão em cada etapa. Leads novos ficam misturados com leads em andamento.

- [ ] **Step 1: Ler o arquivo**

```bash
cat src/pages/corretor/MeusLeads.tsx
```

- [ ] **Step 2: Substituir o conteúdo de `src/pages/corretor/MeusLeads.tsx`**

```tsx
import { Phone, AlertCircle, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import {
    leads,
    getEmpreendimento,
    statusLabels,
    type Lead,
    type LeadStatus,
} from '../../data/mockData';

const CORRETOR_ID = 'cor-1';

const STATUS_GROUPS: { status: LeadStatus; color: string }[] = [
    { status: 'novo',            color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { status: 'em_atendimento',  color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { status: 'contatado',       color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { status: 'visita_marcada',  color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { status: 'proposta',        color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { status: 'venda',           color: 'text-green-600 bg-green-50 border-green-200' },
    { status: 'perdido',         color: 'text-slate-500 bg-slate-50 border-slate-200' },
];

export function MeusLeads() {
    const { setCurrentPage, setSelectedLeadId } = useApp();

    const meusLeads = leads.filter(l => l.corretorId === CORRETOR_ID);
    const pendentes = meusLeads.filter(l => l.status === 'novo').length;

    const openLead = (lead: Lead) => {
        setSelectedLeadId(lead.id);
        setCurrentPage('lead-detalhe');
    };

    // Group leads by status, preserving STATUS_GROUPS order, skip empty groups
    const groups = STATUS_GROUPS
        .map(g => ({
            ...g,
            leads: meusLeads
                .filter(l => l.status === g.status)
                .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()),
        }))
        .filter(g => g.leads.length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meus Leads</h1>
                <p className="text-text-secondary text-sm mt-1">{meusLeads.length} leads atribuídos — João Mendes</p>
            </div>

            {/* Status summary bar */}
            <div className="flex flex-wrap gap-2">
                {groups.map(g => (
                    <span key={g.status} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${g.color}`}>
                        <span className="font-bold">{g.leads.length}</span>
                        {statusLabels[g.status]}
                    </span>
                ))}
            </div>

            {pendentes > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        Você tem <span className="font-bold">{pendentes}</span> lead{pendentes > 1 ? 's' : ''} aguardando primeiro contato!
                    </p>
                </div>
            )}

            {/* Grouped lead list */}
            <div className="space-y-8">
                {groups.map(group => (
                    <div key={group.status}>
                        {/* Group header */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${group.color}`}>
                                {group.leads.length}
                            </span>
                            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                {statusLabels[group.status]}
                            </h2>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Leads in group */}
                        <div className="space-y-2">
                            {group.leads.map(lead => {
                                const emp = getEmpreendimento(lead.empreendimentoId);
                                const timeAgo = getTimeAgo(new Date(lead.criadoEm));

                                return (
                                    <Card
                                        key={lead.id}
                                        variant="hover"
                                        className="p-4 cursor-pointer"
                                        onClick={() => openLead(lead)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0 font-bold text-sm text-brand">
                                                    {lead.nome.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{lead.nome}</p>
                                                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                                        <span>{emp?.nome}</span>
                                                        <span>·</span>
                                                        <span>{timeAgo}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={`tel:${lead.telefone}`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-colors"
                                                >
                                                    <Phone size={14} />
                                                </a>
                                                <a
                                                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                                                >
                                                    <MessageCircle size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
}
```

**Nota:** Este arquivo importa `statusLabels` e `LeadStatus` de `mockData` — verifique que esses exports existem no arquivo de dados. Se `statusLabels` não for um export nomeado, ajuste o import.

- [ ] **Step 3: Verificar no browser**

1. Navegar para "Meus Leads" como corretor
2. Os leads devem aparecer agrupados por status com separadores visuais
3. O summary bar no topo deve mostrar contadores coloridos por etapa
4. Clicar em um lead deve abrir o LeadDetalhe normalmente
5. Os botões de telefone e WhatsApp devem funcionar (stopPropagation)

- [ ] **Step 4: Commit**

```bash
git add src/pages/corretor/MeusLeads.tsx
git commit -m "design: group corretor leads by status with color-coded counters and section dividers"
```

---

### Task 6c: LeadDetalhe — Consistência de Botões e Acessibilidade

**Problema:** O LeadDetalhe tem 3 botões de ação com estilos inline totalmente fora do design system (hardcoded `bg-gradient-to-r`, `bg-red-600`, `bg-brand`) e 6 ocorrências de `text-[10px]` que violam legibilidade mínima.

**Botões afetados (com estilo inline):**
1. Linha ~473: "Avançar para..." / "Iniciar Atendimento" — `bg-gradient-to-r from-teal-500 to-emerald-600`
2. Linha ~521: "Encerrar Atendimento (Perdido)" — estilo inline red
3. Linha ~544: "Confirmar Perda" dentro do modal — `bg-red-600`

**Textos `text-[10px]` a corrigir:**
1. Linha ~337: `<span className="text-[10px] text-text-muted">agora</span>`
2. Linha ~338: `<span className="text-[10px] text-text-muted">meta: 10 min</span>`
3. Linha ~387: `<p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Visita Agendada</p>`
4. Linha ~648: `<span className="text-[10px] font-bold uppercase tracking-wider ...">` (status da nota)
5. Linha ~651: `<span className="text-[10px] text-text-muted">` (de status anterior)
6. Linha ~658: `<span className="text-[10px] text-text-muted whitespace-nowrap ...">`  (timestamp da nota)
7. Linha ~667: `className={... text-[10px] ...}` nos insight tags
8. Linha ~674: `className={... text-[10px] ...}` nos simple tags

- [ ] **Step 1: Ler o arquivo**

```bash
cat src/pages/corretor/LeadDetalhe.tsx
```

- [ ] **Step 2: Corrigir o botão principal "Avançar/Iniciar" (~linha 470)**

Localizar o `<button>` com `bg-gradient-to-r from-teal-500`:
```tsx
<button
    onClick={() => handleStatusClick(nextStatus)}
    disabled={autoCloseWarning || (lead.status === 'em_atendimento' && tentativasContato >= 3)}
    className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${nextStatus === 'em_atendimento'
        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
        : 'bg-brand hover:bg-brand-dark'
        }`}
>
```

Substituir por:
```tsx
<button
    onClick={() => handleStatusClick(nextStatus)}
    disabled={autoCloseWarning || (lead.status === 'em_atendimento' && tentativasContato >= 3)}
    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-b from-brand to-brand-accent shadow-sm shadow-brand/20 hover:shadow-md hover:shadow-brand/25 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
>
```

- [ ] **Step 3: Corrigir o botão "Encerrar Atendimento (Perdido)" (~linha 519)**

Localizar:
```tsx
<button
    onClick={() => setShowLostModal(true)}
    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all shadow-sm hover:shadow"
>
    <Ban size={18} />
    Encerrar Atendimento (Perdido)
</button>
```

Substituir por:
```tsx
<button
    onClick={() => setShowLostModal(true)}
    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
>
    <Ban size={18} />
    Encerrar Atendimento (Perdido)
</button>
```

- [ ] **Step 4: Corrigir o botão "Confirmar Perda" dentro do modal (~linha 543)**

Localizar:
```tsx
<button
    disabled={!motivoPerdido.trim()}
    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
>
    Confirmar Perda
</button>
```

Substituir por:
```tsx
<button
    disabled={!motivoPerdido.trim()}
    onClick={() => {
        lead!.status = 'perdido';
        lead!.motivoPerdido = motivoPerdido;
        setShowLostModal(false);
        setMotivoPerdido('');
    }}
    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
    Confirmar Perda
</button>
```

- [ ] **Step 5: Corrigir os textos `text-[10px]` no SLA Banner (~linhas 337-338)**

Localizar:
```tsx
<span className="text-[10px] text-text-muted">agora</span>
<span className="text-[10px] text-text-muted">meta: 10 min</span>
```

Substituir por:
```tsx
<span className="text-xs text-text-muted">agora</span>
<span className="text-xs text-text-muted">meta: 10 min</span>
```

- [ ] **Step 6: Corrigir `text-[10px]` no card de "Visita Agendada" (~linha 387)**

Localizar:
```tsx
<p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Visita Agendada</p>
```

Substituir por:
```tsx
<p className="text-xs font-bold uppercase tracking-wider opacity-70">Visita Agendada</p>
```

- [ ] **Step 7: Corrigir `text-[10px]` nas notas (~linhas 648-674)**

Localizar e substituir todas as ocorrências de `text-[10px]` dentro do bloco de renderização de notas (`notas.map(...)`):

```tsx
// Status da nota: text-[10px] → text-xs (2 ocorrências no bloco de nota.statusDe/statusPara)
// Timestamp da nota: text-[10px] → text-xs
// Insight tags compound: text-[10px] → text-xs
// Insight tags simple: text-[10px] → text-xs
```

Para cada ocorrência encontrada com `text-[10px]` neste bloco, substituir por `text-xs`. São 4-5 substituições no bloco `{notas.map(nota => (...))}`.

- [ ] **Step 8: Verificar no browser**

1. Abrir qualquer lead como corretor
2. O botão de avançar/iniciar deve ter gradiente verde consistente com os demais botões do app
3. A barra de SLA deve ter textos "agora" e "meta: 10 min" legíveis
4. As notas devem ter timestamps e tags legíveis
5. Clicar "Encerrar Atendimento" deve abrir o modal vermelho
6. O modal de perda deve ter o botão "Confirmar Perda" funcionando

- [ ] **Step 9: Commit**

```bash
git add src/pages/corretor/LeadDetalhe.tsx
git commit -m "design: fix LeadDetalhe button consistency with design system, fix 8 sub-12px text violations"
```

---

## Self-Review Checklist

### Spec Coverage

| Melhoria da critique | Tarefa |
|----------------------|--------|
| Font loading (Inter via Google Fonts) | Task 1 ✅ |
| `text-text-muted` contraste WCAG AA | Task 1 ✅ |
| Shadow scale tokens | Task 1 ✅ |
| Button primary com gradient + micro-interação | Task 2 ✅ |
| Button secondary com bg-white + hover border | Task 2 ✅ |
| Card size variants | Task 3 ✅ |
| Sidebar left bar active indicator | Task 4 ✅ |
| `animate-bounce` → `animate-pulse` no badge | Task 5 ✅ |
| `text-[10px]`/`text-[11px]` → `text-xs` (Layout.tsx) | Task 5 ✅ |
| Corretor dashboard layout 2 colunas + hero gradient | Task 6a ✅ |
| KPI numbers font-light | Task 6a ✅ |
| MeusLeads agrupamento por status com contadores | Task 6b ✅ |
| LeadDetalhe botões inline → design system | Task 6c ✅ |
| `text-[10px]` no LeadDetalhe (8 ocorrências) | Task 6c ✅ |

### Itens deliberadamente fora do escopo

- **Logo/wordmark da marca** — requer decisão de design/branding, não é código
- **ProfileSwitcher no header** — artefato de desenvolvimento; remoção requer decisão de produto
- **Busca fullscreen no mobile** — nova feature, não polish
- **MeusEmpreendimentos** — card com placeholder genérico (Building2 icon) é limitação de dados, não de design

---

## Ordem de Execução Recomendada

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6a → Task 6b → Task 6c
```

Tasks 1-5 são no design system (componentes e tokens). Tasks 6a-6c são nas páginas do corretor. Ambos os grupos podem ser executados em paralelo se desejado, pois não há dependências cruzadas.

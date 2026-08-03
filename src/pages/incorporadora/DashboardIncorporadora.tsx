import { ArrowUpRight, CalendarClock, Check, ChevronRight, Clock3, MessageCircle, MoreHorizontal, Plus, Reply, Target, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { corretores, empreendimentos, getCorretor, getEmpreendimento, leads, type Lead, type LeadStatus } from '../../data/mockData';

const statusMeta: Record<LeadStatus, { label: string; tone: string }> = {
    novo: { label: 'Novo', tone: 'bg-info-bg text-info' },
    em_atendimento: { label: 'Ativo', tone: 'bg-[#eeeafd] text-[#5c4eaa]' },
    contatado: { label: 'Conversando', tone: 'bg-[#eeeafd] text-[#5c4eaa]' },
    visita_marcada: { label: 'Reunião marcada', tone: 'bg-warning-bg text-warning' },
    proposta: { label: 'Proposta enviada', tone: 'bg-warning-bg text-warning' },
    venda: { label: 'Ganho', tone: 'bg-success-bg text-success' },
    perdido: { label: 'Perdido', tone: 'bg-alert-bg text-alert' },
};

function relativeTime(date: string) {
    const hours = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 3600000));
    return hours < 24 ? `há ${hours}h` : `há ${Math.round(hours / 24)}d`;
}

function reason(lead: Lead) {
    if (lead.status === 'novo') return 'Novo lead sem primeiro contato';
    if (lead.status === 'proposta') return 'Aguardando retorno da proposta';
    if (lead.status === 'visita_marcada') return lead.dataVisita ? `Reunião marcada · ${new Date(lead.dataVisita).toLocaleDateString('pt-BR')}` : 'Reunião marcada';
    return 'Conversando, precisa de próximo passo';
}

function AttentionCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
    const status = statusMeta[lead.status];
    const emp = getEmpreendimento(lead.empreendimentoId);
    const corretor = getCorretor(lead.corretorId);
    const initials = lead.nome.split(' ').map((part) => part[0]).slice(0, 2).join('');
    return <article className="attention-card p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center text-sm font-bold shrink-0">{initials}</div><div className="min-w-0"><h3 className="text-sm font-bold truncate">{lead.nome}</h3><p className="text-[11px] text-text-secondary truncate">{emp?.nome || 'Empreendimento não informado'} · {corretor?.nome || 'Sem responsável'}</p></div></div>
            <div className="flex items-center gap-1 shrink-0"><span className={`px-2 py-1 rounded-md text-[10px] font-bold ${status.tone}`}>{status.label}</span><button className="w-10 h-10 rounded-md text-text-muted hover:bg-bg focus-ring flex items-center justify-center" aria-label={`Mais opções para ${lead.nome}`}><MoreHorizontal size={16} /></button></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><p className="text-[10px] mono uppercase tracking-[.14em] text-text-secondary mb-1">Último movimento</p><p className="text-xs text-text-secondary">{lead.historico.at(-1)?.descricao || 'Sem histórico'} <span className="text-text-muted">· {relativeTime(lead.historico.at(-1)?.data || lead.criadoEm)}</span></p></div><div><p className="text-[10px] mono uppercase tracking-[.14em] text-text-secondary mb-1">Próxima ação</p><p className="text-xs font-semibold">{reason(lead)}</p></div></div>
        <div className="flex items-center gap-2 pt-1"><button onClick={onOpen} className="flex-1 min-h-10 px-3 rounded-lg bg-[#7869c9] text-white text-xs font-bold hover:bg-[#5c4eaa] focus-ring flex items-center justify-center gap-2"><MessageCircle size={14} /> Abrir conversa</button><button onClick={onOpen} className="min-h-10 px-3 rounded-lg border border-border text-text-secondary text-xs font-bold hover:bg-bg focus-ring flex items-center gap-2"><Clock3 size={14} /> Follow-up</button></div>
    </article>;
}

export function DashboardIncorporadora() {
    const { setCurrentPage } = useApp();
    const needsAttention = useMemo(() => leads.filter((lead) => ['novo', 'contatado', 'visita_marcada', 'proposta'].includes(lead.status)), []);
    const attention = needsAttention.slice(0, 4);
    const followUpsToday = leads.filter((lead) => ['visita_marcada', 'proposta'].includes(lead.status));
    const withoutNextAction = leads.filter((lead) => ['novo', 'contatado'].includes(lead.status));
    const stages = [{ status: 'novo' as LeadStatus, label: 'Novo' }, { status: 'contatado' as LeadStatus, label: 'Em contato' }, { status: 'visita_marcada' as LeadStatus, label: 'Reunião' }, { status: 'proposta' as LeadStatus, label: 'Proposta' }, { status: 'venda' as LeadStatus, label: 'Ganho' }].map((stage) => ({ ...stage, count: leads.filter((lead) => lead.status === stage.status).length }));
    const responded = leads.filter((lead) => lead.firstResponseAt).length;
    const qualified = leads.filter((lead) => ['visita_marcada', 'proposta', 'venda'].includes(lead.status)).length;
    const recent = leads.flatMap((lead) => lead.historico.slice(-1).map((event) => ({ ...event, leadName: lead.nome }))).slice(0, 5);
    const openLeads = () => setCurrentPage('leads');

    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-8">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Quinta-feira · 30 de julho</p><h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Bom dia, Filipe.</h1><p className="text-sm text-text-secondary mt-2">Existem <strong className="text-text-primary">{needsAttention.length} conversas</strong> que merecem sua atenção hoje. O próximo movimento está aqui.</p></div><button onClick={openLeads} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#5c4eaa] focus-ring"><Plus size={15} /> Adicionar lead</button></section>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[
            { label: 'Novos leads', value: leads.filter((l) => l.status === 'novo').length, helper: 'últimos 30 dias', icon: UsersRound, tone: 'text-info' },
            { label: 'Respondidos', value: responded, helper: `${leads.length ? Math.round(responded / leads.length * 100) : 0}% da base`, icon: Reply, tone: 'text-success' },
            { label: 'Qualificados', value: qualified, helper: 'com avanço real', icon: Target, tone: 'text-[#7869c9]' },
            { label: 'Follow-ups', value: followUpsToday.length, helper: 'para hoje', icon: CalendarClock, tone: 'text-warning' },
            { label: 'Sem próximo passo', value: withoutNextAction.length, helper: 'revisar agora', icon: ArrowUpRight, tone: 'text-alert' },
        ].map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="soft-panel p-4"><div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div><p className="text-2xl font-extrabold mt-3">{value}</p><p className="text-[11px] text-text-secondary mt-1">{helper}</p></div>)}</section>

        <section><div className="flex items-end justify-between mb-4"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Prioridade operacional</p><h2 className="text-lg font-extrabold mt-1">Minha atenção hoje</h2></div><button onClick={openLeads} className="text-xs font-bold text-[#5c4eaa] flex items-center gap-1 hover:underline">Ver todos <ChevronRight size={14} /></button></div><div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{attention.map((lead) => <AttentionCard key={lead.id} lead={lead} onOpen={openLeads} />)}</div></section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5"><div className="soft-panel p-5"><div className="flex items-start justify-between mb-6"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Visão resumida</p><h2 className="text-lg font-extrabold mt-1">Pipeline comercial</h2></div><button onClick={openLeads} className="w-10 h-10 text-text-muted hover:text-text-primary focus-ring flex items-center justify-center" aria-label="Abrir pipeline"><ArrowUpRight size={17} /></button></div><div className="flex flex-wrap gap-2">{stages.map((stage, index) => <div key={stage.status} className="flex items-center gap-2 flex-1 min-w-[105px]"><div className="flex-1"><div className="flex justify-between items-baseline mb-2"><span className="text-xs font-bold">{stage.label}</span><span className="mono text-[11px] text-text-muted">{stage.count}</span></div><div className="h-2 rounded-full bg-bg overflow-hidden"><div className={`h-full rounded-full ${index === 0 ? 'bg-[#368f9d]' : index === 4 ? 'bg-[#4c9b78]' : 'bg-[#7869c9]'}`} style={{ width: `${Math.max(stage.count / Math.max(...stages.map((item) => item.count), 1) * 100, 6)}%` }} /></div></div>{index < stages.length - 1 && <ChevronRight size={14} className="text-border-strong shrink-0 hidden sm:block" />}</div>)}</div></div><div className="soft-panel p-5"><div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Próximos movimentos</p><h2 className="text-lg font-extrabold mt-1">Follow-ups</h2></div><CalendarClock size={18} className="text-warning" /></div><div className="space-y-3">{followUpsToday.slice(0, 3).map((lead) => <button key={lead.id} onClick={openLeads} className="w-full min-h-10 flex items-center gap-3 text-left group focus-ring"><div className="w-10 h-10 rounded-full bg-warning-bg text-warning flex items-center justify-center shrink-0"><Clock3 size={14} /></div><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{lead.nome}</p><p className="text-[11px] text-text-secondary truncate">{reason(lead)}</p></div><ChevronRight size={15} className="text-text-muted group-hover:text-text-primary" /></button>)}{followUpsToday.length === 0 && <p className="text-xs text-text-secondary">Nenhum follow-up informado.</p>}</div></div></section>

        <section className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5"><div className="soft-panel p-5"><div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Saúde comercial</p><h2 className="text-lg font-extrabold mt-1">O que está avançando</h2></div><span className="px-2 py-1 rounded-md bg-success-bg text-success text-[10px] font-bold">Base atual</span></div><div className="grid grid-cols-2 gap-3">{[{ label: 'Conversão em visita', value: `${leads.length ? Math.round(qualified / leads.length * 100) : 0}%` }, { label: 'Empreendimentos ativos', value: empreendimentos.length }, { label: 'Corretores ativos', value: corretores.filter((c) => c.ativo).length }, { label: 'Leads em ganho', value: leads.filter((l) => l.status === 'venda').length }].map((item) => <div key={item.label} className="rounded-lg bg-bg p-3"><p className="text-[10px] text-text-secondary">{item.label}</p><p className="text-xl font-extrabold mt-2">{item.value}</p></div>)}</div></div><div className="soft-panel p-5"><div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Movimento que importa</p><h2 className="text-lg font-extrabold mt-1">Atividade recente</h2></div><ArrowUpRight size={16} className="text-text-muted" /></div><div className="space-y-4">{recent.map((event, index) => <div key={`${event.id}-${index}`} className="flex gap-3"><div className="mt-1 w-7 h-7 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center shrink-0"><Check size={13} /></div><div className="min-w-0"><p className="text-xs font-semibold">{event.leadName}</p><p className="text-[11px] text-text-secondary truncate">{event.descricao}</p></div><span className="mono text-[9px] text-text-faint ml-auto whitespace-nowrap">agora</span></div>)}</div></div></section>
    </div>;
}

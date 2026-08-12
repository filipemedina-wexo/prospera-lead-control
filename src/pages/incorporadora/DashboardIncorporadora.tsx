import { ArrowRight, CalendarClock, CheckCircle2, Plus, Target, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTenantLeads } from '../../lib/leadRepository';
import { type LeadStatus, statusLabels } from '../../data/mockData';

const stages: LeadStatus[] = ['novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda'];

function relativeTime(value: string) {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? `${hours} h atrás` : `${Math.floor(hours / 24)} d atrás`;
}

export function DashboardIncorporadora() {
    const { setCurrentPage } = useApp();
    const { profile } = useAuth();
    const { items: leads, loading, error } = useTenantLeads(profile?.incorporadora_id);
    const metrics = useMemo(() => {
        const newLeads = leads.filter((lead) => lead.status === 'novo').length;
        const responded = leads.filter((lead) => Boolean(lead.firstResponseAt)).length;
        const qualified = leads.filter((lead) => ['visita_marcada', 'proposta', 'venda'].includes(lead.status)).length;
        const followUps = leads.filter((lead) => ['visita_marcada', 'proposta'].includes(lead.status)).length;
        return { newLeads, responded, qualified, followUps };
    }, [leads]);
    const attention = leads.filter((lead) => ['novo', 'contatado', 'visita_marcada', 'proposta'].includes(lead.status)).slice(0, 5);
    const openLeads = () => setCurrentPage('leads');

    if (loading) return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-8 md:px-8 text-sm text-text-secondary">Carregando sua operação...</div>;

    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-8">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Operação ao vivo</p><h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Olá, {profile?.nome?.split(' ')[0] || 'tudo bem'}.</h1><p className="text-sm text-text-secondary mt-2">Acompanhe os leads reais da sua operação.</p></div><button onClick={openLeads} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#5c4eaa] focus-ring"><Plus size={15} /> Ver leads</button></section>

        {error && <section className="soft-panel p-4 border-red-200 bg-red-50 text-sm text-red-700">Não foi possível carregar os dados: {error}</section>}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[
            { label: 'Novos leads', value: metrics.newLeads, helper: 'aguardando contato', icon: UsersRound, tone: 'text-info' },
            { label: 'Respondidos', value: metrics.responded, helper: `${leads.length ? Math.round(metrics.responded / leads.length * 100) : 0}% da base`, icon: CheckCircle2, tone: 'text-success' },
            { label: 'Qualificados', value: metrics.qualified, helper: 'visita, proposta ou venda', icon: Target, tone: 'text-[#7869c9]' },
            { label: 'Follow-ups', value: metrics.followUps, helper: 'visita ou proposta', icon: CalendarClock, tone: 'text-warning' },
        ].map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="soft-panel p-4"><div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div><p className="text-2xl font-extrabold mt-3">{value}</p><p className="text-[11px] text-text-secondary mt-1">{helper}</p></div>)}</section>

        <section className="soft-panel p-5"><div className="flex items-end justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Pipeline</p><h2 className="text-lg font-extrabold mt-1">Etapas da operação</h2></div><button onClick={openLeads} className="text-xs font-bold text-[#5c4eaa] flex items-center gap-1 hover:underline">Ver todos <ArrowRight size={14} /></button></div><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{stages.map((stage) => <div key={stage} className="rounded-lg bg-bg p-3"><p className="text-[10px] text-text-secondary">{statusLabels[stage]}</p><p className="text-xl font-extrabold mt-2">{leads.filter((lead) => lead.status === stage).length}</p></div>)}</div></section>

        <section><div className="flex items-end justify-between mb-4"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Prioridade operacional</p><h2 className="text-lg font-extrabold mt-1">Leads que pedem atenção</h2></div></div>{attention.length === 0 ? <div className="soft-panel p-10 text-center"><p className="font-bold">Sua operação começa vazia.</p><p className="text-sm text-text-secondary mt-1">Quando um lead entrar pelo webhook, ele aparecerá aqui.</p></div> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{attention.map((lead) => <button key={lead.id} onClick={openLeads} className="attention-card text-left p-4 flex items-center gap-3 hover:bg-bg focus-ring"><div className="w-10 h-10 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center font-bold shrink-0">{lead.nome.charAt(0)}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{lead.nome}</p><p className="text-[11px] text-text-secondary truncate">{lead.empreendimentoNome || 'Empreendimento não informado'} · {relativeTime(lead.criadoEm)}</p></div><span className="text-xs font-bold text-[#5c4eaa]">{statusLabels[lead.status]}</span></button>)}</div>}</section>
    </div>;
}

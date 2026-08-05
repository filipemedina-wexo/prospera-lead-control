import { Activity, ArrowUpRight, CalendarCheck, MessageSquare, PhoneCall, Trophy, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { FunnelChart } from '../../components/ui/FunnelChart';
import { type LeadStatus, getSlaMinutes, isSlaEstourado } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAgencyBrokers, useAgencyLeads } from '../../lib/leadRepository';

const funnelStatuses: LeadStatus[] = ['novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];

export function DashboardImobiliaria() {
    const { setCurrentPage } = useApp();
    const { profile } = useAuth();
    const { items: leads, loading, error } = useAgencyLeads(profile?.imobiliaria_id);
    const { items: brokers } = useAgencyBrokers(profile?.imobiliaria_id);
    const metrics = useMemo(() => {
        const responded = leads.filter((lead) => lead.firstResponseAt).length;
        const followUps = leads.filter((lead) => lead.historico.some((entry) => entry.tipo === 'interacao' || entry.tipo === 'status_alterado')).length;
        const visits = leads.filter((lead) => ['visita_marcada', 'proposta', 'venda'].includes(lead.status)).length;
        const answered = leads.filter((lead) => lead.firstResponseAt);
        const avgSla = answered.length ? Math.round(answered.reduce((sum, lead) => sum + (getSlaMinutes(lead) || 0), 0) / answered.length) : null;
        const stale = leads.filter((lead) => lead.status === 'novo' && !lead.firstResponseAt && isSlaEstourado(lead));
        const funnel = funnelStatuses.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
        const ranking = brokers.map((broker) => {
            const own = leads.filter((lead) => lead.corretorId === broker.id);
            const contacts = own.filter((lead) => lead.firstResponseAt).length;
            const advances = own.filter((lead) => ['visita_marcada', 'proposta', 'venda'].includes(lead.status)).length;
            return { ...broker, contacts, advances, score: contacts * 30 + advances * 50 + own.filter((lead) => lead.status === 'venda').length * 20 };
        }).sort((a, b) => b.score - a.score);
        return { responded, followUps, visits, avgSla, stale, funnel, ranking };
    }, [leads, brokers]);

    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-8">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Operacao ao vivo</p><h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Cockpit da imobiliaria</h1><p className="text-sm text-text-secondary mt-2">{loading ? 'Carregando a carteira...' : `Sua equipe tem ${leads.length} lead${leads.length === 1 ? '' : 's'} na carteira.`}</p></div><button onClick={() => setCurrentPage('leads')} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#5c4eaa] focus-ring"><UsersRound size={15} /> Ver leads</button></section>
        {error && <section className="soft-panel p-4 border-red-200 bg-red-50 text-sm text-red-700">Nao foi possivel carregar a operacao: {error}</section>}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[{ label: 'Leads na base', value: leads.length, helper: 'carteira atual', icon: UsersRound, tone: 'text-info' }, { label: 'Respondidos', value: metrics.responded, helper: `${leads.length ? Math.round(metrics.responded / leads.length * 100) : 0}% da base`, icon: PhoneCall, tone: 'text-success' }, { label: 'Follow-ups', value: metrics.followUps, helper: 'interacoes registradas', icon: MessageSquare, tone: 'text-[#7869c9]' }, { label: 'Visitas', value: metrics.visits, helper: 'com avanço real', icon: CalendarCheck, tone: 'text-warning' }, { label: 'SLA estourado', value: leads.filter(isSlaEstourado).length, helper: 'revisar agora', icon: ArrowUpRight, tone: 'text-alert' }].map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="soft-panel p-4"><div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div><p className="text-2xl font-extrabold mt-3">{value}</p><p className="text-[11px] text-text-secondary mt-1">{helper}</p></div>)}</section>
        {metrics.stale.length > 0 && <section className="soft-panel p-4 border-warning/30 bg-warning-bg"><p className="text-xs font-bold text-warning uppercase tracking-wider">Atencao operacional</p><p className="text-sm text-warning/90 mt-1">{metrics.stale.length} lead{metrics.stale.length > 1 ? 's estao' : ' esta'} alem do SLA sem primeiro contato.</p></section>}
        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5"><div className="soft-panel p-5"><div className="flex items-start justify-between mb-6"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Visao resumida</p><h2 className="text-lg font-extrabold mt-1">Funil da equipe</h2></div><span className="text-[11px] text-text-secondary">{brokers.filter((broker) => broker.ativo).length} corretores ativos</span></div><FunnelChart data={metrics.funnel} /></div><div className="soft-panel p-5"><div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Ranking interno</p><h2 className="text-lg font-extrabold mt-1">Performance</h2></div><Trophy size={18} className="text-warning" /></div><div className="space-y-3">{metrics.ranking.slice(0, 5).map((broker, index) => <div key={broker.id} className="flex items-center gap-3"><span className="mono text-[11px] text-text-muted w-4">{index + 1}</span><div className="w-8 h-8 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center text-xs font-bold">{broker.nome.charAt(0)}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{broker.nome}</p><p className="text-[10px] text-text-secondary">{broker.contacts} contatos · {broker.advances} avancos</p></div><span className="text-xs font-extrabold text-[#7869c9]">{broker.score} pts</span></div>)}{!loading && metrics.ranking.length === 0 && <p className="text-sm text-text-secondary py-4">Nenhum corretor vinculado ainda.</p>}</div></div></section>
        <section className="soft-panel p-5"><div className="flex items-center gap-2 mb-5"><Activity size={17} className="text-[#7869c9]" /><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Saude operacional</p><h2 className="text-lg font-extrabold mt-1">Indicadores do time</h2></div></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[{ label: 'Contatos por lead', value: `${leads.length ? Math.round(metrics.responded / leads.length * 100) : 0}%` }, { label: 'Visitas no processo', value: `${leads.length ? Math.round(metrics.visits / leads.length * 100) : 0}%` }, { label: 'SLA medio', value: metrics.avgSla === null ? '—' : `${metrics.avgSla} min` }, { label: 'Corretores ativos', value: brokers.filter((broker) => broker.ativo).length }].map((item) => <div key={item.label} className="rounded-lg bg-bg p-3"><p className="text-[10px] text-text-secondary">{item.label}</p><p className="text-xl font-extrabold mt-2">{item.value}</p></div>)}</div></section>
    </div>;
}

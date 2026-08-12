import { AlertCircle, ArrowRight, ArrowUpRight, Calendar, Clock3, Target, TrendingUp, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { type Lead, type LeadStatus, statusLabels } from '../../data/mockData';
import { useBrokerLeads } from '../../lib/leadRepository';

const SLA_MINUTES = 10;

function responseMinutes(lead: Lead) {
  if (!lead.firstResponseAt) return null;
  return Math.max(0, Math.round((new Date(lead.firstResponseAt).getTime() - new Date(lead.criadoEm).getTime()) / 60_000));
}

function waitingMinutes(lead: Lead) {
  return Math.max(0, Math.floor((Date.now() - new Date(lead.criadoEm).getTime()) / 60_000));
}

export function DashboardCorretor() {
  const { setCurrentPage, setSelectedLeadId } = useApp();
  const { profile } = useAuth();
  const { items: mine, loading, error } = useBrokerLeads(profile?.corretor_id);
  const metrics = useMemo(() => {
    const active = mine.filter(lead => !['venda', 'perdido'].includes(lead.status)).length;
    const sales = mine.filter(lead => lead.status === 'venda').length;
    const visits = mine.filter(lead => lead.status === 'visita_marcada').length;
    const responded = mine.filter(lead => Boolean(lead.firstResponseAt));
    const values = responded.map(responseMinutes).filter((value): value is number => value !== null);
    const avgSla = values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
    const pending = mine.filter(lead => lead.status === 'novo' && !lead.firstResponseAt);
    const breached = pending.filter(lead => waitingMinutes(lead) > SLA_MINUTES);
    return { active, sales, visits, responded: responded.length, avgSla, pending, breached };
  }, [mine]);
  const priorityLeads = useMemo(() => [...metrics.pending, ...mine.filter(lead => ['visita_marcada', 'proposta'].includes(lead.status))]
    .filter((lead, index, collection) => collection.findIndex(item => item.id === lead.id) === index)
    .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())
    .slice(0, 5), [metrics.pending, mine]);
  const openLead = (leadId: string) => { setSelectedLeadId(leadId); setCurrentPage('lead-detalhe'); };
  const initials = (profile?.nome || profile?.email || 'C').split(/[ @]/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const metricsCards = [
    { label: 'Leads ativos', value: metrics.active, helper: 'na sua carteira', icon: UsersRound, tone: 'text-info' },
    { label: 'SLA médio', value: metrics.responded ? `${metrics.avgSla}m` : '—', helper: metrics.breached.length ? 'revisar agora' : 'dentro do limite', icon: Clock3, tone: metrics.breached.length ? 'text-alert' : 'text-success' },
    { label: 'Visitas marcadas', value: metrics.visits, helper: 'na carteira', icon: Calendar, tone: 'text-warning' },
    { label: 'Vendas', value: metrics.sales, helper: 'registradas', icon: TrendingUp, tone: 'text-success' },
    { label: 'Conversão', value: `${mine.length ? Math.round((metrics.sales / mine.length) * 100) : 0}%`, helper: `${mine.length} leads distribuídos`, icon: ArrowUpRight, tone: 'text-[#7869c9]' },
  ];

  if (loading) return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-8 md:px-8 text-sm text-text-secondary">Carregando sua carteira...</div>;

  return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">
    <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Operação ao vivo</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center font-bold">{initials}</div><div><h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Olá, {profile?.nome?.split(' ')[0] || 'corretor'}.</h1><p className="text-sm text-text-secondary mt-1">Você tem <strong className="text-text-primary">{metrics.active} leads ativos</strong>. Comece pelo que precisa de resposta agora.</p></div></div></div><button onClick={() => setCurrentPage('meus-leads')} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#5c4eaa] focus-ring"><UsersRound size={15} /> Ver carteira</button></section>
    {error && <section className="soft-panel p-4 border-red-200 bg-red-50 text-sm text-red-700">Não foi possível carregar sua carteira: {error}</section>}
    <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{metricsCards.map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="soft-panel p-4"><div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div><p className="text-2xl font-extrabold mt-3">{value}</p><p className="text-[11px] text-text-secondary mt-1">{helper}</p></div>)}</section>
    {metrics.breached.length > 0 && <section className="soft-panel p-4 border-warning/30 bg-warning-bg flex items-center gap-3"><AlertCircle size={18} className="text-warning shrink-0" /><p className="text-sm text-warning/90"><strong>{metrics.breached.length}</strong> lead{metrics.breached.length > 1 ? 's passaram' : ' passou'} do SLA de {SLA_MINUTES} minutos sem primeiro contato.</p></section>}
    <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start"><div className="soft-panel p-5"><div className="flex items-start justify-between gap-4 mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Prioridade operacional</p><h2 className="text-lg font-extrabold mt-1">Atenda estes leads primeiro</h2></div><AlertCircle size={18} className="text-alert mt-1" /></div>{priorityLeads.length ? <div className="space-y-2">{priorityLeads.map(lead => <PriorityLead key={lead.id} lead={lead} onOpen={openLead} />)}</div> : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-text-secondary">Nenhum lead pendente no momento.</p>}<button onClick={() => setCurrentPage('meus-leads')} className="mt-4 text-sm text-brand font-bold hover:underline flex items-center gap-1 focus-ring">Ver carteira completa <ArrowRight size={14} /></button></div><aside className="soft-panel p-5"><div className="flex items-start justify-between gap-3"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-[#7869c9]">Ritmo operacional</p><h2 className="text-lg font-extrabold mt-1">Primeiro atendimento</h2><p className="text-[11px] text-text-secondary mt-1">Métrica baseada nos atendimentos já registrados.</p></div><Target size={18} className="text-[#7869c9]" /></div><div className="flex justify-between mt-5 text-[11px]"><span className="font-bold">{metrics.responded} respondido{metrics.responded === 1 ? '' : 's'}</span><span className="text-text-secondary">{mine.length} distribuídos</span></div><div className="h-2 rounded-full bg-bg mt-2 overflow-hidden"><div className="h-full rounded-full bg-[#7869c9]" style={{ width: `${mine.length ? Math.round(metrics.responded / mine.length * 100) : 0}%` }} /></div><p className="text-[11px] text-text-secondary mt-2">{mine.length ? `${Math.round(metrics.responded / mine.length * 100)}% da carteira com primeiro atendimento.` : 'Os próximos leads distribuídos aparecerão aqui.'}</p></aside></section>
  </div>;
}

function PriorityLead({ lead, onOpen }: { lead: Lead; onOpen: (id: string) => void }) {
  const pending = lead.status === 'novo' && !lead.firstResponseAt;
  return <button onClick={() => onOpen(lead.id)} className="w-full rounded-xl border border-border p-3 flex items-center gap-3 text-left hover:border-brand/30 hover:bg-brand/5 transition-colors focus-ring"><div className="w-10 h-10 rounded-full bg-primary-soft text-brand flex items-center justify-center shrink-0 text-sm font-bold">{lead.nome.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{lead.nome}</p><p className="text-[11px] text-text-secondary flex items-center gap-1"><Clock3 size={12} />{pending ? `Novo lead · ${waitingMinutes(lead)} min aguardando contato` : `Etapa atual · ${statusLabels[lead.status as LeadStatus]}`}</p></div><span className="text-[11px] font-bold text-brand bg-primary-soft px-2 py-1 rounded-full">{statusLabels[lead.status]}</span><ArrowRight size={15} className="text-text-muted" /></button>;
}

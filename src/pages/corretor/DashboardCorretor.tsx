import {
    AlertCircle,
    ArrowRight,
    ArrowUpRight,
    Calendar,
    Clock3,
    Star,
    Target,
    TrendingUp,
    UsersRound,
} from 'lucide-react';
import { SmartSuggestions } from '../../components/ui/SmartSuggestions';
import { useApp } from '../../context/AppContext';
import {
    corretores,
    getSlaMinutes,
    isSlaEstourado,
    leads,
    performanceMetas,
    smartSuggestions,
} from '../../data/mockData';

const CORRETOR_ID = 'cor-1';

export function DashboardCorretor() {
    const { setCurrentPage, setSelectedLeadId } = useApp();
    const corretor = corretores.find((item) => item.id === CORRETOR_ID);
    const mine = leads.filter((lead) => lead.corretorId === CORRETOR_ID);
    const active = mine.filter((lead) => !['venda', 'perdido'].includes(lead.status)).length;
    const sales = mine.filter((lead) => lead.status === 'venda').length;
    const visits = mine.filter((lead) => lead.status === 'visita_marcada').length;
    const slaValues = mine.map(getSlaMinutes).filter((value): value is number => value !== null);
    const avgSla = slaValues.length ? Math.round(slaValues.reduce((total, value) => total + value, 0) / slaValues.length) : 0;
    const priorityLeads = mine
        .filter((lead) => ['novo', 'visita_marcada', 'proposta'].includes(lead.status))
        .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
        .slice(0, 3);
    const points = corretor?.pontos ?? 0;
    const nextLevel = points >= 500 ? 500 : points >= 300 ? 500 : points >= 150 ? 300 : 150;
    const initials = corretor?.nome.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'C';
    const openLead = (leadId: string) => {
        setSelectedLeadId(leadId);
        setCurrentPage('lead-detalhe');
    };

    const metrics = [
        { label: 'Leads ativos', value: active, helper: 'em atendimento', icon: UsersRound, tone: 'text-info' },
        { label: 'SLA médio', value: `${avgSla}m`, helper: mine.some(isSlaEstourado) ? 'revisar agora' : 'dentro do limite', icon: Clock3, tone: avgSla > 10 ? 'text-alert' : 'text-success' },
        { label: 'Visitas marcadas', value: visits, helper: 'na carteira', icon: Calendar, tone: 'text-warning' },
        { label: 'Vendas', value: sales, helper: 'no período', icon: TrendingUp, tone: 'text-success' },
        { label: 'Conversão', value: `${mine.length ? Math.round((sales / mine.length) * 100) : 0}%`, helper: `${mine.length} leads distribuídos`, icon: ArrowUpRight, tone: 'text-[#7869c9]' },
    ];

    return (
        <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                <div>
                    <p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Quinta-feira · 30 de julho</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center font-bold">{initials}</div>
                        <div>
                            <h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Bom dia, {corretor?.nome.split(' ')[0] || 'corretor'}.</h1>
                            <p className="text-sm text-text-secondary mt-1">Você tem <strong className="text-text-primary">{active} leads ativos</strong>. Comece pelo que precisa de resposta agora.</p>
                        </div>
                    </div>
                </div>
                <div className="soft-panel w-full lg:w-[190px] p-3">
                    <div className="flex items-center justify-between"><span className="mono text-[10px] uppercase tracking-[.14em] text-text-muted">Nível Black</span><Star size={15} className="text-warning" fill="currentColor" /></div>
                    <div className="flex items-end justify-between mt-2"><strong className="text-xl font-extrabold">{points}</strong><span className="text-[11px] text-text-secondary">/ {nextLevel} pts</span></div>
                    <div className="h-1.5 rounded-full bg-bg mt-2 overflow-hidden"><div className="h-full rounded-full bg-[#7869c9]" style={{ width: `${Math.min((points / nextLevel) * 100, 100)}%` }} /></div>
                </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
                    <div key={label} className="soft-panel p-4">
                        <div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div>
                        <p className="text-2xl font-extrabold mt-3">{value}</p>
                        <p className="text-[11px] text-text-secondary mt-1">{helper}</p>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
                <div className="soft-panel p-5">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Prioridade operacional</p><h2 className="text-lg font-extrabold mt-1">Atenda estes leads primeiro</h2></div>
                        <AlertCircle size={18} className="text-alert mt-1" />
                    </div>
                    <div className="space-y-2">
                        {priorityLeads.map((lead) => (
                            <button key={lead.id} onClick={() => openLead(lead.id)} className="w-full rounded-xl border border-border p-3 flex items-center gap-3 text-left hover:border-brand/30 hover:bg-brand/5 transition-colors focus-ring">
                                <div className="w-10 h-10 rounded-full bg-primary-soft text-brand flex items-center justify-center shrink-0 text-sm font-bold">{lead.nome.slice(0, 2).toUpperCase()}</div>
                                <div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{lead.nome}</p><p className="text-[11px] text-text-secondary flex items-center gap-1"><Clock3 size={12} /> Novo lead · aguarda primeiro contato</p></div>
                                <span className="text-[11px] font-bold text-brand bg-primary-soft px-2 py-1 rounded-full">Novo</span>
                                <ArrowRight size={15} className="text-text-muted" />
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setCurrentPage('meus-leads')} className="mt-4 text-sm text-brand font-bold hover:underline flex items-center gap-1 focus-ring">Ver carteira completa <ArrowRight size={14} /></button>
                </div>

                <aside className="soft-panel p-5">
                    <div className="flex items-start justify-between gap-3"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-warning">Campanha ativa</p><h2 className="text-lg font-extrabold mt-1">Sprint de Vendas</h2><p className="text-[11px] text-text-secondary mt-1">Residencial Aurora · 7 dias restantes</p></div><Star size={18} className="text-warning" fill="currentColor" /></div>
                    <p className="text-sm text-text-secondary mt-5">Alcance 400 pontos neste mês para liberar o bônus da campanha.</p>
                    <div className="flex justify-between mt-5 text-[11px]"><span className="font-bold">{points} pontos</span><span className="text-text-secondary">Meta: 400</span></div>
                    <div className="h-2 rounded-full bg-bg mt-2 overflow-hidden"><div className="h-full rounded-full bg-[#7869c9]" style={{ width: `${Math.min((points / 400) * 100, 100)}%` }} /></div>
                    <p className="text-[11px] text-success mt-2">Meta atingida · prêmio disponível</p>
                </aside>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] gap-5 items-start">
                <div className="soft-panel p-5">
                    <div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Ritmo da semana</p><h2 className="text-lg font-extrabold mt-1">Meta semanal</h2></div><Target size={18} className="text-[#7869c9]" /></div>
                    <div className="flex justify-between text-xs mb-2"><span className="text-text-secondary">Progresso</span><strong className="text-[#7869c9]">{performanceMetas.weeklyGoal}%</strong></div>
                    <div className="h-2 rounded-full bg-bg overflow-hidden"><div className="h-full rounded-full bg-[#7869c9]" style={{ width: `${performanceMetas.weeklyGoal}%` }} /></div>
                    <div className="flex justify-between mt-3 text-[11px] text-text-secondary"><span>{performanceMetas.tasksCompleted} tarefas completas</span><span>{performanceMetas.tasksPending} pendentes</span></div>
                </div>
                <SmartSuggestions suggestions={smartSuggestions} />
            </section>
        </div>
    );
}

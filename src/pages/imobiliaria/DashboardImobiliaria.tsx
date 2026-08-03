import { Activity, ArrowUpRight, CalendarCheck, ChevronRight, MessageSquare, PhoneCall, Trophy, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { FunnelChart } from '../../components/ui/FunnelChart';
import { leads, corretores, rankingImobiliarias, metasCorretores, getSlaMinutes, isSlaEstourado, type LeadStatus, listaCampanhas } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const IMOB_ID = 'imob-1';
export function DashboardImobiliaria() {
    const { setCurrentPage } = useApp();
    const [now] = useState(() => Date.now());
    const mine = leads.filter(l => l.imobiliariaId === IMOB_ID);
    const team = corretores.filter(c => c.imobiliariaId === IMOB_ID && c.ativo);
    const responded = mine.filter(l => l.firstResponseAt).length;
    const followUps = mine.filter(l => l.historico.some(h => h.tipo === 'interacao' || h.tipo === 'status_alterado')).length;
    const visits = mine.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;
    const withResponse = mine.filter(l => l.firstResponseAt);
    const avgSla = withResponse.length ? Math.round(withResponse.reduce((sum, l) => sum + (getSlaMinutes(l) || 0), 0) / withResponse.length) : 0;
    const stale = mine.filter(l => l.status === 'novo' && !l.firstResponseAt && now - new Date(l.criadoEm).getTime() > 3600000);
    const statusOrder: LeadStatus[] = ['novo', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];
    const funnel = statusOrder.map(status => ({ status, count: mine.filter(l => l.status === status).length }));
    const ranking = team.map(c => {
        const own = leads.filter(l => l.corretorId === c.id);
        const vendas = own.filter(l => l.status === 'venda').length;
        const visitas = own.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;
        const contatos = own.filter(l => l.firstResponseAt).length;
        const follow = own.filter(l => l.historico.some(h => h.tipo === 'interacao' || h.tipo === 'status_alterado')).length;
        const response = own.filter(l => l.firstResponseAt);
        const sla = response.length ? Math.round(response.reduce((sum, l) => sum + (getSlaMinutes(l) || 0), 0) / response.length) : 0;
        const meta = metasCorretores.find(m => m.corretorId === c.id);
        return { ...c, vendas, visitas, contatos, follow, sla, score: contatos * 30 + visitas * 50 + follow * 10 + (c.tempoOnline || 0) * 5 + vendas * 20, meta: meta?.vendasMes ?? 2 };
    }).sort((a, b) => b.score - a.score);
    const yourRank = rankingImobiliarias.find(r => r.ehSuaImob);
    const activeCampaigns = listaCampanhas.filter(c => c.ativa).length;
    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col gap-8">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Visão gerencial · 30 de julho</p><h1 className="text-[28px] md:text-[32px] leading-tight font-extrabold tracking-[-.04em]">Bom dia, Imobiliária Prime.</h1><p className="text-sm text-text-secondary mt-2">Sua operação tem <strong className="text-text-primary">{mine.length} leads</strong> ativos. Acompanhe o próximo movimento da equipe.</p></div><button onClick={() => setCurrentPage('leads')} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#5c4eaa] focus-ring"><UsersRound size={15} /> Ver leads</button></section>
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[{ label: 'Leads na base', value: mine.length, helper: 'carteira atual', icon: UsersRound, tone: 'text-info' }, { label: 'Respondidos', value: responded, helper: `${mine.length ? Math.round(responded / mine.length * 100) : 0}% da base`, icon: PhoneCall, tone: 'text-success' }, { label: 'Follow-ups', value: followUps, helper: 'interações registradas', icon: MessageSquare, tone: 'text-[#7869c9]' }, { label: 'Visitas', value: visits, helper: 'com avanço real', icon: CalendarCheck, tone: 'text-warning' }, { label: 'SLA estourado', value: mine.filter(isSlaEstourado).length, helper: 'revisar agora', icon: ArrowUpRight, tone: 'text-alert' }].map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="soft-panel p-4"><div className="flex items-center justify-between"><p className="text-[10px] mono uppercase tracking-[.13em] text-text-muted">{label}</p><Icon size={16} className={tone} /></div><p className="text-2xl font-extrabold mt-3">{value}</p><p className="text-[11px] text-text-secondary mt-1">{helper}</p></div>)}</section>
        {stale.length > 0 && <section className="soft-panel p-4 border-warning/30 bg-warning-bg"><p className="text-xs font-bold text-warning uppercase tracking-wider">Atenção operacional</p><p className="text-sm text-warning/90 mt-1">{stale.length} lead{stale.length > 1 ? 's estão' : ' está'} há mais de 1h sem primeiro contato. Revise a distribuição da equipe.</p></section>}
        {activeCampaigns > 0 && <button onClick={() => setCurrentPage('campanhas')} className="soft-panel p-4 flex items-center justify-between text-left hover:border-[#d8c7b8] focus-ring"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-[#bd7d43]">Campanha ativa</p><p className="text-sm font-bold mt-1">A incorporadora lançou {activeCampaigns} campanha{activeCampaigns > 1 ? 's' : ''} de vendas.</p><p className="text-xs text-text-secondary mt-1">Acompanhe o desempenho do time e os incentivos disponíveis.</p></div><ChevronRight size={18} className="text-text-muted" /></button>}
        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5"><div className="soft-panel p-5"><div className="flex items-start justify-between mb-6"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Visão resumida</p><h2 className="text-lg font-extrabold mt-1">Funil da equipe</h2></div><span className="text-[11px] text-text-secondary">{team.length} corretores ativos</span></div><FunnelChart data={funnel} /></div><div className="soft-panel p-5"><div className="flex items-start justify-between mb-5"><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Ranking interno</p><h2 className="text-lg font-extrabold mt-1">Performance</h2></div><Trophy size={18} className="text-warning" /></div><div className="space-y-3">{ranking.slice(0, 5).map((c, index) => <div key={c.id} className="flex items-center gap-3"><span className="mono text-[11px] text-text-muted w-4">{index + 1}</span><div className="w-8 h-8 rounded-full bg-[#eeeafd] text-[#5c4eaa] flex items-center justify-center text-xs font-bold">{c.nome.charAt(0)}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{c.nome}</p><p className="text-[10px] text-text-secondary">{c.contatos} contatos · {c.visitas} visitas</p></div><span className="text-xs font-extrabold text-[#7869c9]">{c.score} pts</span></div>)}</div>{yourRank && <div className="mt-5 p-3 rounded-lg bg-[#eeeafd] text-[#5c4eaa]"><p className="text-[10px] mono uppercase tracking-[.14em]">Sua posição no mercado</p><p className="text-xl font-extrabold mt-1">#{yourRank.posicao} <span className="text-xs font-semibold">· {yourRank.scoreTotal.toLocaleString('pt-BR')} pts</span></p></div>}</div></section>
        <section className="soft-panel p-5"><div className="flex items-center gap-2 mb-5"><Activity size={17} className="text-[#7869c9]" /><div><p className="mono text-[10px] uppercase tracking-[.16em] text-text-muted">Saúde operacional</p><h2 className="text-lg font-extrabold mt-1">Indicadores do time</h2></div></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[{ label: 'Contatos por lead', value: `${mine.length ? Math.round(responded / mine.length * 100) : 0}%` }, { label: 'Visitas no processo', value: `${mine.length ? Math.round(visits / mine.length * 100) : 0}%` }, { label: 'SLA médio', value: `${avgSla}min` }, { label: 'Corretores ativos', value: team.length }].map(item => <div key={item.label} className="rounded-lg bg-bg p-3"><p className="text-[10px] text-text-secondary">{item.label}</p><p className="text-xl font-extrabold mt-2">{item.value}</p></div>)}</div></section>
    </div>;
}

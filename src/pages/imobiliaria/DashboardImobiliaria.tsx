import { Trophy, Activity, MapPin, TrendingUp, TrendingDown, Minus, AlertCircle, Clock, PhoneCall, CalendarCheck, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { FunnelChart } from '../../components/ui/FunnelChart';
import {
    leads,
    corretores,
    empreendimentos,
    rankingImobiliarias,
    metasCorretores,
    getSlaMinutes,
    isSlaEstourado,
    type LeadStatus,
    listaCampanhas
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const IMOB_ID = 'imob-1';

function VariacaoIcon({ v }: { v: number }) {
    if (v > 0) return <TrendingUp size={14} className="text-success" />;
    if (v < 0) return <TrendingDown size={14} className="text-alert" />;
    return <Minus size={14} className="text-text-muted" />;
}

export function DashboardImobiliaria() {
    const { setCurrentPage } = useApp();
    const imobLeads = leads.filter(l => l.imobiliariaId === IMOB_ID);
    const imobCorretores = corretores.filter(c => c.imobiliariaId === IMOB_ID && c.ativo);

    const totalLeads = imobLeads.length;
    const slaEstourado = imobLeads.filter(l => isSlaEstourado(l)).length;

    // Métricas de processo
    const contatos = imobLeads.filter(l => l.firstResponseAt).length;
    const followUps = imobLeads.filter(l =>
        l.historico.some(h => h.tipo === 'interacao' || h.tipo === 'status_alterado')
    ).length;
    const visitasMarcadas = imobLeads.filter(l =>
        ['visita_marcada', 'proposta', 'venda'].includes(l.status)
    ).length;

    const withResp = imobLeads.filter(l => l.firstResponseAt);
    const avgSla = withResp.length > 0
        ? Math.round(withResp.reduce((s, l) => s + (getSlaMinutes(l) || 0), 0) / withResp.length)
        : 0;

    // Taxa de avanço de processo
    const taxaContato = totalLeads > 0 ? Math.round((contatos / totalLeads) * 100) : 0;
    const taxaVisita = totalLeads > 0 ? Math.round((visitasMarcadas / totalLeads) * 100) : 0;

    const statusOrder: LeadStatus[] = ['novo', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];
    const funnelData = statusOrder.map(s => ({ status: s, count: imobLeads.filter(l => l.status === s).length }));

    // Ranking interno de corretores
    const ranking = imobCorretores.map(c => {
        const cLeads = leads.filter(l => l.corretorId === c.id);
        const vendas = cLeads.filter(l => l.status === 'venda').length;
        const visitas = cLeads.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;
        const contatos = cLeads.filter(l => l.firstResponseAt).length;
        const followUps = cLeads.filter(l =>
            l.historico.some(h => h.tipo === 'interacao' || h.tipo === 'status_alterado')
        ).length;
        const interacoes = cLeads.reduce((acc, l) => acc + l.historico.filter(h => h.autor === c.nome).length, 0);
        // Score foca em processo: contatos pesam +, visitas muito, follow-ups, horas online; vendas têm peso simbólico
        const score = (contatos * 30) + (visitas * 50) + (followUps * 10) + ((c.tempoOnline || 0) * 5) + (vendas * 20);
        const cWithResp = cLeads.filter(l => l.firstResponseAt);
        const sla = cWithResp.length > 0
            ? Math.round(cWithResp.reduce((s, l) => s + (getSlaMinutes(l) || 0), 0) / cWithResp.length)
            : 0;
        const meta = metasCorretores.find(m => m.corretorId === c.id);
        const metaVendas = meta?.vendasMes ?? 2;
        return { ...c, vendas, visitas, contatos, followUps, interacoes, totalLeads: cLeads.length, slaAvg: sla, score, metaVendas };
    }).sort((a, b) => b.score - a.score);

    // Alertas: corretores com leads novos há mais de 1h sem resposta
    const alertas = imobCorretores.map(c => {
        const parados = leads.filter(l =>
            l.corretorId === c.id &&
            l.status === 'novo' &&
            !l.firstResponseAt &&
            (Date.now() - new Date(l.criadoEm).getTime()) > 3600000
        );
        return { corretor: c, leadsParados: parados.length };
    }).filter(a => a.leadsParados > 0);

    const suaImob = rankingImobiliarias.find(r => r.ehSuaImob);

    return (
        <div className="space-y-6">
            {/* Hero de boas-vindas */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand/70 p-6 text-white shadow-lg">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-white/70 text-sm font-medium">Visão gerencial</p>
                        <h1 className="text-2xl font-bold mt-0.5">Imobiliária Prime</h1>
                    </div>
                </div>
            </div>

            {/* Banner de Campanhas Ativas (Se existirem) */}
            {listaCampanhas.filter(c => c.ativa).length > 0 && (
                <div 
                    onClick={() => setCurrentPage('campanhas')}
                    className="bg-lvl-gold/10 border border-lvl-gold/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-lvl-gold/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-lvl-gold rounded-lg text-black">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                                A Incorporadora lançou {listaCampanhas.filter(c => c.ativa).length} {listaCampanhas.filter(c => c.ativa).length > 1 ? 'Campanhas' : 'Campanha'} de Vendas!
                                <span className="px-2 py-0.5 text-[9px] bg-green-500/20 text-green-400 rounded-full border border-green-500/30 uppercase tracking-widest animate-pulse">Live</span>
                            </h3>
                            <p className="text-xs text-text-secondary mt-0.5">Motive sua equipe a participar e bater as metas para ganhar os prêmios.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-bg px-3 py-1.5 rounded-lg border border-border">
                            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Tamanho do Time</div>
                            <div className="text-sm font-bold text-text-primary text-lvl-gold">{imobCorretores.length} corretores</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alertas de Time */}
            {alertas.length > 0 && (
                <Card className="p-4 border-warning/30 bg-warning-bg">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-warning text-sm">Atenção necessária</p>
                            <div className="mt-1 space-y-0.5">
                                {alertas.map(a => (
                                    <p key={a.corretor.id} className="text-xs text-warning/80">
                                        <span className="font-medium">{a.corretor.nome}</span> tem {a.leadsParados} lead{a.leadsParados > 1 ? 's' : ''} sem contato há mais de 1h
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* KPIs — foco em atividades de processo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Contatos feitos */}
                <Card variant="hover" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Contatos</p>
                        <PhoneCall size={16} className="text-brand" />
                    </div>
                    <p className="text-3xl font-bold">{contatos}</p>
                    <p className="text-xs text-text-muted mt-1">{taxaContato}% dos leads</p>
                </Card>

                {/* Follow-ups */}
                <Card variant="hover" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Follow-ups</p>
                        <MessageSquare size={16} className="text-info" />
                    </div>
                    <p className="text-3xl font-bold text-info">{followUps}</p>
                    <p className="text-xs text-text-muted mt-1">Interações registradas</p>
                </Card>

                {/* Visitas marcadas */}
                <Card variant="hover" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Visitas</p>
                        <CalendarCheck size={16} className="text-success" />
                    </div>
                    <p className="text-3xl font-bold text-success">{visitasMarcadas}</p>
                    <p className="text-xs text-text-muted mt-1">{taxaVisita}% chegaram à visita</p>
                </Card>

                {/* SLA */}
                <Card variant="hover" className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">SLA Médio</p>
                        <Clock size={16} className="text-brand" />
                    </div>
                    <p className={`text-3xl font-bold ${avgSla <= 5 ? 'text-success' : avgSla <= 10 ? 'text-warning' : 'text-alert'}`}>{avgSla}min</p>
                    <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${avgSla <= 5 ? 'bg-success' : avgSla <= 10 ? 'bg-warning' : 'bg-alert'}`}
                            style={{ width: `${Math.min((avgSla / 15) * 100, 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5">Meta: ≤5min · {slaEstourado} estourados</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funil */}
                <Card variant="hover" className="p-6 lg:col-span-2">
                    <h2 className="text-base font-semibold mb-1">Funil da Equipe</h2>
                    <p className="text-sm text-text-muted mb-4">Distribuição de leads por etapa</p>
                    <FunnelChart data={funnelData} />
                </Card>

                {/* Ranking externo */}
                <Card variant="hover" className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy size={16} className="text-brand" />
                        <h2 className="text-base font-semibold">Ranking de Imobiliárias</h2>
                    </div>
                    <p className="text-xs text-text-muted mb-4">Pontuação geral do período</p>

                    {suaImob && (
                        <div className="mb-4 p-3 rounded-xl bg-brand/10 border border-brand/20">
                            <p className="text-xs text-brand font-medium uppercase tracking-wider mb-1">Sua posição</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-brand">#{suaImob.posicao}</span>
                                    <div className="flex items-center gap-1">
                                        <VariacaoIcon v={suaImob.variacao} />
                                        {suaImob.variacao !== 0 && (
                                            <span className={`text-xs font-medium ${suaImob.variacao > 0 ? 'text-success' : 'text-alert'}`}>
                                                {suaImob.variacao > 0 ? '+' : ''}{suaImob.variacao}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold">{suaImob.scoreTotal.toLocaleString('pt-BR')} pts</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {rankingImobiliarias.map(r => (
                            <div key={r.posicao} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${r.ehSuaImob ? 'bg-brand/5 border border-brand/20' : 'hover:bg-black/[0.02]'}`}>
                                <span className={`text-sm font-bold w-5 ${r.posicao === 1 ? 'text-lvl-gold' : 'text-text-muted'}`}>
                                    {r.posicao}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${r.ehSuaImob ? 'text-brand' : ''}`}>{r.nomeExibido}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <VariacaoIcon v={r.variacao} />
                                    <span className="text-sm font-semibold text-text-primary">{r.scoreTotal.toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-text-muted text-center mt-3">Score = Vendas×100 + Visitas×20 + Atividades + Horas online×5</p>
                </Card>
            </div>

            {/* Tabela de performance — métricas de processo em destaque */}
            <Card variant="hover" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-brand" />
                    <h2 className="text-base font-semibold">Performance da Equipe</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[580px]">
                        <thead>
                            <tr className="text-xs text-text-muted border-b border-border">
                                <th className="text-left pb-3 font-medium w-8">#</th>
                                <th className="text-left pb-3 font-medium">Corretor</th>
                                <th className="text-center pb-3 font-medium">
                                    <span className="flex items-center justify-center gap-1"><PhoneCall size={11} />Contatos</span>
                                </th>
                                <th className="text-center pb-3 font-medium">
                                    <span className="flex items-center justify-center gap-1"><MessageSquare size={11} />Follow-ups</span>
                                </th>
                                <th className="text-center pb-3 font-medium">
                                    <span className="flex items-center justify-center gap-1"><CalendarCheck size={11} />Visitas</span>
                                </th>
                                <th className="text-center pb-3 font-medium">SLA</th>
                                <th className="text-center pb-3 font-medium">Score</th>
                                <th className="text-center pb-3 font-medium">
                                    <Trophy size={12} className="text-lvl-gold mx-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((c, i) => (
                                <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-black/[0.01]">
                                    <td className="py-3">
                                        <span className={`text-sm font-bold ${i === 0 ? 'text-lvl-gold' : 'text-text-muted'}`}>{i + 1}</span>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold shrink-0 relative overflow-hidden">
                                                {c.avatarUrl
                                                    ? <img src={c.avatarUrl} className="w-full h-full rounded-full object-cover" alt={c.nome} />
                                                    : c.nome.charAt(0)
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{c.nome}</p>
                                                <p className="text-[10px] text-text-muted">{c.tempoOnline}h online</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Métricas de processo — destaque principal */}
                                    <td className="py-3 text-center">
                                        <span className="text-sm font-semibold text-brand">{c.contatos}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="text-sm font-semibold text-info">{c.followUps}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="text-sm font-semibold text-success">{c.visitas}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.slaAvg <= 5 ? 'bg-success-bg text-success' : c.slaAvg <= 10 ? 'bg-warning-bg text-warning' : 'bg-alert-bg text-alert'}`}>
                                            {c.slaAvg}min
                                        </span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="text-sm font-bold text-brand">{c.score}</span>
                                    </td>
                                    {/* Venda — simbólica, celebratória */}
                                    <td className="py-3 text-center">
                                        {c.vendas > 0 ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <Trophy size={14} className="text-lvl-gold" fill="currentColor" />
                                                <span className="text-xs font-bold text-lvl-gold">{c.vendas}</span>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[10px] text-text-muted mt-3">Score = Contatos×30 + Visitas×50 + Follow-ups×10 + Horas online×5</p>
            </Card>

            {/* Empreendimentos com mais leads */}
            <Card variant="hover" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-brand" />
                    <h2 className="text-base font-semibold">Leads por Empreendimento</h2>
                </div>
                <div className="space-y-3">
                    {empreendimentos.map(emp => {
                        const empLeads = imobLeads.filter(l => l.empreendimentoId === emp.id);
                        if (empLeads.length === 0) return null;
                        const empVendas = empLeads.filter(l => l.status === 'venda').length;
                        const empPct = Math.round((empLeads.length / totalLeads) * 100);
                        return (
                            <div key={emp.id} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium truncate">{emp.nome}</span>
                                        <span className="text-xs text-text-muted ml-2 shrink-0">{empLeads.length} leads · {empVendas} vendas</span>
                                    </div>
                                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand/70 rounded-full" style={{ width: `${empPct}%` }} />
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-text-muted w-8 text-right">{empPct}%</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

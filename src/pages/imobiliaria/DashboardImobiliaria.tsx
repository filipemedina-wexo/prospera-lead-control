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
} from '../../data/mockData';

const IMOB_ID = 'imob-1';

function VariacaoIcon({ v }: { v: number }) {
    if (v > 0) return <TrendingUp size={14} className="text-green-500" />;
    if (v < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-text-muted" />;
}

export function DashboardImobiliaria() {
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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-text-secondary text-sm mt-1">Visão gerencial — Imobiliária Prime</p>
            </div>

            {/* Alertas de Time */}
            {alertas.length > 0 && (
                <Card className="p-4 border-amber-300 bg-amber-50/40">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-800 text-sm">Atenção necessária</p>
                            <div className="mt-1 space-y-0.5">
                                {alertas.map(a => (
                                    <p key={a.corretor.id} className="text-xs text-amber-700">
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
                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <PhoneCall size={15} className="text-brand" />
                        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Contatos</span>
                    </div>
                    <p className="text-2xl font-bold">{contatos}</p>
                    <p className="text-xs text-text-muted mt-1">{taxaContato}% dos leads</p>
                </Card>

                {/* Follow-ups */}
                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={15} className="text-violet-500" />
                        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Follow-ups</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-600">{followUps}</p>
                    <p className="text-xs text-text-muted mt-1">Interações registradas</p>
                </Card>

                {/* Visitas marcadas */}
                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarCheck size={15} className="text-emerald-500" />
                        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Visitas</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{visitasMarcadas}</p>
                    <p className="text-xs text-text-muted mt-1">{taxaVisita}% chegaram à visita</p>
                </Card>

                {/* SLA */}
                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={15} className="text-brand" />
                        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">SLA Médio</span>
                    </div>
                    <p className={`text-2xl font-bold ${avgSla <= 5 ? 'text-green-600' : avgSla <= 10 ? 'text-amber-500' : 'text-red-500'}`}>{avgSla}min</p>
                    <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${avgSla <= 5 ? 'bg-green-500' : avgSla <= 10 ? 'bg-amber-400' : 'bg-red-500'}`}
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
                                            <span className={`text-xs font-medium ${suaImob.variacao > 0 ? 'text-green-600' : 'text-red-500'}`}>
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
                                <span className={`text-sm font-bold w-5 ${r.posicao === 1 ? 'text-yellow-500' : 'text-text-muted'}`}>
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
                                    <Trophy size={12} className="text-yellow-400 mx-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((c, i) => (
                                <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-black/[0.01]">
                                    <td className="py-3">
                                        <span className={`text-sm font-bold ${i === 0 ? 'text-yellow-500' : 'text-text-muted'}`}>{i + 1}</span>
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
                                        <span className="text-sm font-semibold text-violet-600">{c.followUps}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="text-sm font-semibold text-emerald-600">{c.visitas}</span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.slaAvg <= 5 ? 'bg-green-50 text-green-700' : c.slaAvg <= 10 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
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
                                                <Trophy size={14} className="text-yellow-500" fill="currentColor" />
                                                <span className="text-xs font-bold text-yellow-600">{c.vendas}</span>
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

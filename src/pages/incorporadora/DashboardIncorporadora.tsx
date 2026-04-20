import { Clock, AlertTriangle, Trophy, Users, Activity, MapPin, Monitor } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { FunnelChart } from '../../components/ui/FunnelChart';
import {
    leads,
    empreendimentos,
    imobiliarias,
    corretores,
    getImobiliaria,
    getSlaMinutes,
    isSlaEstourado,
    type LeadStatus,
} from '../../data/mockData';

export function DashboardIncorporadora() {
    // Compute metrics
    const totalLeads = leads.length;
    const slaEstourado = leads.filter(l => isSlaEstourado(l)).length;
    const slaPct = Math.round((slaEstourado / totalLeads) * 100);

    const leadsWithResponse = leads.filter(l => l.firstResponseAt);
    const avgSla = leadsWithResponse.length > 0
        ? Math.round(leadsWithResponse.reduce((sum, l) => sum + (getSlaMinutes(l) || 0), 0) / leadsWithResponse.length)
        : 0;

    const visitas = leads.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;
    const taxaVisita = totalLeads > 0 ? Math.round((visitas / totalLeads) * 100) : 0;

    // Funnel data
    const statusOrder: LeadStatus[] = ['novo', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];
    const funnelData = statusOrder.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }));

    // Leads por empreendimento
    const leadsByEmp = empreendimentos.map(emp => ({
        nome: emp.nome,
        count: leads.filter(l => l.empreendimentoId === emp.id).length,
    })).sort((a, b) => b.count - a.count);

    // Leads por imobiliária
    const leadsByImob = imobiliarias.map(im => ({
        nome: im.nome,
        count: leads.filter(l => l.imobiliariaId === im.id).length,
    })).sort((a, b) => b.count - a.count);

    // Ranking corretores (by vendas, then visitas)
    // Ranking corretores (by Score)
    const corretoresAtivos = corretores.filter(c => c.ativo);
    const ranking = corretoresAtivos.map(c => {
        const cLeads = leads.filter(l => l.corretorId === c.id);
        const cVendas = cLeads.filter(l => l.status === 'venda').length;
        const cVisitas = cLeads.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;

        // Interações
        const interacoes = cLeads.reduce((acc, l) => {
            return acc + l.historico.filter(h => h.autor === c.nome).length;
        }, 0);

        const tempoOnline = c.tempoOnline || 0;

        // Score
        const score = (cVendas * 100) + (cVisitas * 20) + (interacoes * 1) + (tempoOnline * 5);

        const cWithResp = cLeads.filter(l => l.firstResponseAt);
        const cSla = cWithResp.length > 0
            ? Math.round(cWithResp.reduce((s, l) => s + (getSlaMinutes(l) || 0), 0) / cWithResp.length)
            : 0;

        const imob = getImobiliaria(c.imobiliariaId);
        return {
            ...c,
            vendas: cVendas,
            visitas: cVisitas,
            interacoes,
            tempoOnline,
            score,
            totalLeads: cLeads.length,
            slaAvg: cSla,
            imobNome: imob?.nome || ''
        };
    }).sort((a, b) => b.score - a.score);

    const maxEmp = Math.max(...leadsByEmp.map(e => e.count), 1);
    const maxImob = Math.max(...leadsByImob.map(i => i.count), 1);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-text-secondary text-sm mt-1">Visão geral da operação — Construtora Horizonte</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-2">
                        <Users size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Total Leads</span>
                    </div>
                    <p className="text-2xl font-bold">{totalLeads}</p>
                    <p className="text-xs text-text-muted mt-1">nos últimos 30 dias</p>
                </Card>

                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-2">
                        <MapPin size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Taxa de Visita</span>
                    </div>
                    <p className="text-2xl font-bold text-brand">{taxaVisita}%</p>
                    <p className="text-xs text-text-muted mt-1">{visitas} visitas de {totalLeads} leads</p>
                </Card>

                <Card variant="hover" className="p-5 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-text-muted mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">SLA Médio</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{avgSla} min</p>
                        <span className="text-xs text-text-muted mb-1">Meta: 5min</span>
                    </div>
                    <div className="mt-3 relative h-2 bg-black/5 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 w-0.5 bg-black/20 z-10" style={{ left: `${(5 / Math.max(avgSla * 1.5, 15)) * 100}%` }} title="Meta" />
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${avgSla <= 5 ? 'bg-green-500' : avgSla <= 15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min((avgSla / Math.max(avgSla * 1.5, 15)) * 100, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mt-1 px-0.5">
                        <span>0m</span>
                        <span className="relative left-2">5m</span>
                        <span>{Math.round(Math.max(avgSla * 1.5, 15))}m</span>
                    </div>
                </Card>

                <Card variant="hover" className="p-5">
                    <div className="flex items-center gap-2 text-text-muted mb-2">
                        <AlertTriangle size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">SLA Estourado</span>
                    </div>
                    <p className="text-2xl font-bold text-red-500">{slaEstourado}</p>
                    <p className="text-xs text-text-muted mt-1">{slaPct}% dos leads</p>
                </Card>
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funil */}
                <Card variant="hover" className="lg:col-span-1 p-6">
                    <h2 className="text-base font-semibold mb-1">Funil de Vendas</h2>
                    <p className="text-sm text-text-muted mb-4">Distribuição por status</p>
                    <FunnelChart data={funnelData} />
                </Card>

                {/* Leads por empreendimento */}
                <Card variant="hover" className="p-6">
                    <h2 className="text-base font-semibold mb-1">Por Empreendimento</h2>
                    <p className="text-sm text-text-muted mb-4">Volume de leads</p>
                    <div className="space-y-3">
                        {leadsByEmp.map(e => (
                            <div key={e.nome}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium truncate mr-2">{e.nome}</span>
                                    <span className="text-text-muted shrink-0">{e.count}</span>
                                </div>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-brand" style={{ width: `${(e.count / maxEmp) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Leads por imobiliária */}
                <Card variant="hover" className="p-6">
                    <h2 className="text-base font-semibold mb-1">Por Imobiliária</h2>
                    <p className="text-sm text-text-muted mb-4">Volume de leads</p>
                    <div className="space-y-3">
                        {leadsByImob.map(i => (
                            <div key={i.nome}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium truncate mr-2">{i.nome}</span>
                                    <span className="text-text-muted shrink-0">{i.count}</span>
                                </div>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(i.count / maxImob) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Ranking */}
            <Card variant="hover" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={18} className="text-brand" />
                    <div>
                        <h2 className="text-base font-semibold">Ranking de Corretores</h2>
                        <p className="text-sm text-text-muted">Performance por vendas e SLA</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="pb-3 text-text-muted font-medium w-12">#</th>
                                <th className="pb-3 text-text-muted font-medium">Corretor</th>
                                <th className="pb-3 text-text-muted font-medium">Imobiliária</th>
                                <th className="pb-3 text-text-muted font-medium text-center">Score</th>
                                <th className="pb-3 text-text-muted font-medium text-center" title="Vendas"><Trophy size={14} className="mx-auto" /></th>
                                <th className="pb-3 text-text-muted font-medium text-center" title="Visitas"><MapPin size={14} className="mx-auto" /></th>
                                <th className="pb-3 text-text-muted font-medium text-center" title="Atividades"><Activity size={14} className="mx-auto" /></th>
                                <th className="pb-3 text-text-muted font-medium text-center" title="Tempo Online"><Monitor size={14} className="mx-auto" /></th>
                                <th className="pb-3 text-text-muted font-medium text-center" title="SLA Médio"><Clock size={14} className="mx-auto" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.slice(0, 10).map((c, i) => (
                                <tr key={c.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors group">
                                    <td className="py-3 font-semibold text-text-muted pl-2">{i + 1}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold relative">
                                                {c.nome.charAt(0)}
                                                {i === 0 && <Trophy className="absolute -top-1 -right-1 text-yellow-500 w-3 h-3" fill="currentColor" />}
                                            </div>
                                            <span className="font-medium">{c.nome}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-text-secondary text-xs">{c.imobNome}</td>
                                    <td className="py-3 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                                            {c.score}
                                        </span>
                                    </td>
                                    <td className="py-3 text-center font-bold text-text-primary">{c.vendas}</td>
                                    <td className="py-3 text-center text-text-secondary">{c.visitas}</td>
                                    <td className="py-3 text-center text-text-secondary">{c.interacoes}</td>
                                    <td className="py-3 text-center text-text-secondary">{c.tempoOnline}h</td>
                                    <td className="py-3 text-center">
                                        <span className={c.slaAvg > 10 ? 'text-red-500 font-medium' : 'text-green-600'}>
                                            {c.slaAvg}m
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

import { Search, ArrowRightLeft, RefreshCw, Filter } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
    leads,
    empreendimentos,
    imobiliarias,
    getCorretor,
    getEmpreendimento,
    getImobiliaria,
    getSlaMinutes,
    isSlaEstourado,
    type LeadStatus,
} from '../../data/mockData';

const statusOptions: (LeadStatus | 'todos')[] = ['todos', 'novo', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];

export function LeadsIncorporadora() {
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'todos'>('todos');
    const [filterEmp, setFilterEmp] = useState('todos');
    const [filterImob, setFilterImob] = useState('todos');
    const [search, setSearch] = useState('');

    let filtered = [...leads];
    if (filterStatus !== 'todos') filtered = filtered.filter(l => l.status === filterStatus);
    if (filterEmp !== 'todos') filtered = filtered.filter(l => l.empreendimentoId === filterEmp);
    if (filterImob !== 'todos') filtered = filtered.filter(l => l.imobiliariaId === filterImob);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(l => l.nome.toLowerCase().includes(s) || l.telefone.includes(s));
    }
    filtered.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Todos os Leads</h1>
                    <p className="text-text-secondary text-sm mt-1">{filtered.length} leads encontrados</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-text-muted">
                        <Filter size={16} />
                        <span className="text-sm font-medium">Filtros:</span>
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Nome ou telefone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 w-full sm:w-48"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as LeadStatus | 'todos')}
                        className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                        {statusOptions.map(s => (
                            <option key={s} value={s}>{s === 'todos' ? 'Todos Status' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                        ))}
                    </select>

                    <select
                        value={filterEmp}
                        onChange={e => setFilterEmp(e.target.value)}
                        className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                        <option value="todos">Todos Empreendimentos</option>
                        {empreendimentos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>

                    <select
                        value={filterImob}
                        onChange={e => setFilterImob(e.target.value)}
                        className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                        <option value="todos">Todas Imobiliárias</option>
                        {imobiliarias.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                        <thead>
                            <tr className="border-b border-border text-left bg-black/[0.02]">
                                <th className="px-4 py-3 text-text-muted font-medium">Lead</th>
                                <th className="px-4 py-3 text-text-muted font-medium">Empreendimento</th>
                                <th className="px-4 py-3 text-text-muted font-medium">Imobiliária</th>
                                <th className="px-4 py-3 text-text-muted font-medium">Corretor</th>
                                <th className="px-4 py-3 text-text-muted font-medium">Status</th>
                                <th className="px-4 py-3 text-text-muted font-medium text-center">SLA</th>
                                <th className="px-4 py-3 text-text-muted font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(lead => {
                                const emp = getEmpreendimento(lead.empreendimentoId);
                                const imob = getImobiliaria(lead.imobiliariaId);
                                const cor = getCorretor(lead.corretorId);
                                const sla = getSlaMinutes(lead);
                                const slaOver = isSlaEstourado(lead);

                                return (
                                    <tr key={lead.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">{lead.nome}</p>
                                                <p className="text-xs text-text-muted">{lead.telefone}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary">{emp?.nome}</td>
                                        <td className="px-4 py-3 text-text-secondary">{imob?.nome}</td>
                                        <td className="px-4 py-3 text-text-secondary">{cor?.nome}</td>
                                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={slaOver ? 'text-red-500 font-medium' : 'text-text-secondary'}>
                                                {sla !== null ? `${sla} min` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" className="h-7 w-7 p-0" title="Reatribuir">
                                                    <ArrowRightLeft size={14} />
                                                </Button>
                                                {lead.status === 'perdido' && (
                                                    <Button variant="ghost" className="h-7 w-7 p-0" title="Reativar">
                                                        <RefreshCw size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

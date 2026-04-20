import { useState } from 'react';
import { Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LeadDrawer } from '../../components/ui/LeadDrawer';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import {
    leads,
    corretores,
    getCorretor,
    getEmpreendimento,
    getSlaMinutes,
    isSlaEstourado,
    type LeadStatus,
} from '../../data/mockData';

const IMOB_ID = 'imob-1';
const statusOptions: (LeadStatus | 'todos')[] = ['todos', 'novo', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];

export function LeadsImobiliaria() {
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'todos'>('todos');
    const [filterCor, setFilterCor] = useState('todos');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);

    const imobCorretores = corretores.filter(c => c.imobiliariaId === IMOB_ID);

    let filtered = leads.filter(l => l.imobiliariaId === IMOB_ID);
    if (filterStatus !== 'todos') filtered = filtered.filter(l => l.status === filterStatus);
    if (filterCor !== 'todos') filtered = filtered.filter(l => l.corretorId === filterCor);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(l => l.nome.toLowerCase().includes(s) || l.telefone.includes(s));
    }
    filtered.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return (
        <div className="space-y-6">
            {/* LeadDrawer */}
            <LeadDrawer leadId={drawerLeadId} onClose={() => setDrawerLeadId(null)} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Leads da Equipe</h1>
                    <p className="text-text-secondary text-sm mt-1">{filtered.length} leads — Imobiliária Prime</p>
                </div>
                {/* Toggle de visualização */}
                <div className="flex items-center gap-1 bg-black/[0.04] rounded-xl p-1">
                    <button
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-brand' : 'text-text-muted hover:text-text-primary'
                            }`}
                        onClick={() => setViewMode('list')}
                        title="Visualização em lista"
                    >
                        <LayoutList size={18} />
                    </button>
                    <button
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white shadow text-brand' : 'text-text-muted hover:text-text-primary'
                            }`}
                        onClick={() => setViewMode('kanban')}
                        title="Visualização Kanban"
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-text-muted">
                        <Filter size={16} />
                        <span className="text-sm font-medium">Filtros:</span>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="text" placeholder="Nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 w-full sm:w-48" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as LeadStatus | 'todos')}
                        className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30">
                        {statusOptions.map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos Status' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                    </select>
                    <select value={filterCor} onChange={e => setFilterCor(e.target.value)}
                        className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30">
                        <option value="todos">Todos Corretores</option>
                        {imobCorretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
            </Card>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="-mx-4 md:-mx-6">
                    <KanbanBoard leads={filtered} onCardClick={setDrawerLeadId} />
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead>
                                <tr className="border-b border-border text-left bg-black/[0.02]">
                                    <th className="px-4 py-3 text-text-muted font-medium">Lead</th>
                                    <th className="px-4 py-3 text-text-muted font-medium">Empreendimento</th>
                                    <th className="px-4 py-3 text-text-muted font-medium">Corretor</th>
                                    <th className="px-4 py-3 text-text-muted font-medium">Status</th>
                                    <th className="px-4 py-3 text-text-muted font-medium text-center">SLA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(lead => {
                                    const emp = getEmpreendimento(lead.empreendimentoId);
                                    const cor = getCorretor(lead.corretorId);
                                    const sla = getSlaMinutes(lead);
                                    const slaOver = isSlaEstourado(lead);
                                    return (
                                        <tr
                                            key={lead.id}
                                            className="border-b border-border/50 hover:bg-black/[0.02] transition-colors cursor-pointer"
                                            onClick={() => setDrawerLeadId(lead.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{lead.nome}</p>
                                                <p className="text-xs text-text-muted">{lead.telefone}</p>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary">{emp?.nome}</td>
                                            <td className="px-4 py-3 text-text-secondary">{cor?.nome}</td>
                                            <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={slaOver ? 'text-red-500 font-medium' : 'text-text-secondary'}>
                                                    {sla !== null ? `${sla} min` : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

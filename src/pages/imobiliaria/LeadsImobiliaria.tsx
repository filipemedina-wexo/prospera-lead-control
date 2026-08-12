import { useMemo, useState } from 'react';
import { Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LeadDrawer } from '../../components/ui/LeadDrawer';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { getSlaMinutes, isSlaEstourado, statusLabels, type LeadStatus } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useAgencyBrokers, useAgencyLeads } from '../../lib/leadRepository';

const statusOptions: (LeadStatus | 'todos')[] = ['todos', 'novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];

export function LeadsImobiliaria() {
    const { profile } = useAuth();
    const { items: leads, loading, error } = useAgencyLeads(profile?.imobiliaria_id);
    const { items: brokers } = useAgencyBrokers(profile?.imobiliaria_id);
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'todos'>('todos');
    const [filterBroker, setFilterBroker] = useState('todos');
    const [filterOrigin, setFilterOrigin] = useState('todos');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
    const brokerById = useMemo(() => new Map(brokers.map((broker) => [broker.id, broker])), [brokers]);
    const origins = useMemo(() => Array.from(new Set(leads.map((lead) => lead.origem?.canal).filter(Boolean))) as string[], [leads]);
    const filtered = useMemo(() => leads.filter((lead) => {
        const term = search.trim().toLowerCase();
        return (filterStatus === 'todos' || lead.status === filterStatus)
            && (filterBroker === 'todos' || lead.corretorId === filterBroker)
            && (filterOrigin === 'todos' || lead.origem?.canal === filterOrigin)
            && (!term || `${lead.nome} ${lead.telefone} ${lead.email || ''}`.toLowerCase().includes(term));
    }), [leads, filterStatus, filterBroker, filterOrigin, search]);

    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        <LeadDrawer lead={leads.find((lead) => lead.id === drawerLeadId) || null} brokerName={brokerById.get(leads.find((lead) => lead.id === drawerLeadId)?.corretorId || '')?.nome} onClose={() => setDrawerLeadId(null)} />
        <div className="flex items-center justify-between"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Operacao ao vivo</p><h1 className="text-[28px] font-extrabold tracking-[-.04em]">Leads da equipe</h1><p className="text-text-secondary text-sm mt-1">{loading ? 'Carregando leads...' : `${filtered.length} lead${filtered.length === 1 ? '' : 's'} na carteira`}</p></div><div className="flex items-center gap-1 bg-black/[0.04] rounded-xl p-1"><button className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-brand' : 'text-text-muted hover:text-text-primary'}`} onClick={() => setViewMode('list')} title="Visualizacao em lista"><LayoutList size={18} /></button><button className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white shadow text-brand' : 'text-text-muted hover:text-text-primary'}`} onClick={() => setViewMode('kanban')} title="Visualizacao kanban"><LayoutGrid size={18} /></button></div></div>
        <Card className="p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 text-text-muted"><Filter size={16} /><span className="text-sm font-medium">Filtros:</span></div><div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" placeholder="Nome, telefone ou e-mail..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 w-full sm:w-56" /></div><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as LeadStatus | 'todos')} className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5"><option value="todos">Todos os status</option>{statusOptions.filter((status): status is LeadStatus => status !== 'todos').map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><select value={filterBroker} onChange={(event) => setFilterBroker(event.target.value)} className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5"><option value="todos">Todos os corretores</option>{brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.nome}</option>)}</select><select value={filterOrigin} onChange={(event) => setFilterOrigin(event.target.value)} className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5"><option value="todos">Todas as origens</option>{origins.map((origin) => <option key={origin} value={origin}>{origin}</option>)}</select></div></Card>
        {error && <Card className="p-4 border-red-200 bg-red-50 text-sm text-red-700">Nao foi possivel carregar os leads: {error}</Card>}
        {viewMode === 'kanban' && <div className="-mx-4 md:-mx-6"><KanbanBoard leads={filtered} onCardClick={setDrawerLeadId} /></div>}
        {viewMode === 'list' && <Card className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[750px]"><thead><tr className="border-b border-border text-left bg-black/[0.02]"><th className="px-4 py-3 text-text-muted font-medium">Lead</th><th className="px-4 py-3 text-text-muted font-medium">Empreendimento</th><th className="px-4 py-3 text-text-muted font-medium">Origem</th><th className="px-4 py-3 text-text-muted font-medium">Corretor</th><th className="px-4 py-3 text-text-muted font-medium">Status</th><th className="px-4 py-3 text-text-muted font-medium text-center">SLA</th></tr></thead><tbody>{!loading && filtered.map((lead) => { const sla = getSlaMinutes(lead); const broker = brokerById.get(lead.corretorId); return <tr key={lead.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors cursor-pointer" onClick={() => setDrawerLeadId(lead.id)}><td className="px-4 py-3"><p className="font-medium">{lead.nome}</p><p className="text-xs text-text-muted">{lead.telefone}</p></td><td className="px-4 py-3 text-text-secondary">{lead.empreendimentoNome || 'Nao informado'}</td><td className="px-4 py-3">{lead.origem ? <div className="flex flex-col"><span className="font-medium text-xs text-text-primary">{lead.origem.canal}</span><span className="text-[10px] text-text-muted truncate max-w-[120px]">{lead.origem.campanha || '—'}</span></div> : <span className="text-text-muted text-xs">—</span>}</td><td className="px-4 py-3 text-text-secondary">{broker?.nome || 'Nao atribuido'}</td><td className="px-4 py-3"><StatusBadge status={lead.status} /></td><td className="px-4 py-3 text-center"><span className={isSlaEstourado(lead) ? 'text-red-500 font-medium' : 'text-text-secondary'}>{sla !== null ? `${sla} min` : '—'}</span></td></tr>; })}</tbody></table></div>{!loading && filtered.length === 0 && <div className="text-center py-12"><p className="font-semibold">Nenhum lead ainda.</p><p className="text-sm text-text-secondary mt-1">Os leads distribuidos para sua imobiliaria aparecerao nesta lista.</p></div>}</Card>}
    </div>;
}

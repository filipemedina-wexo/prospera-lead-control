import { Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useTenantLeads } from '../../lib/leadRepository';
import { type LeadStatus, statusLabels } from '../../data/mockData';

const statusOptions: (LeadStatus | 'todos')[] = ['todos', 'novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido'];

export function LeadsIncorporadora() {
    const { profile } = useAuth();
    const { items: leads, loading, error } = useTenantLeads(profile?.incorporadora_id);
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'todos'>('todos');
    const [filterEmp, setFilterEmp] = useState('todos');
    const [search, setSearch] = useState('');
    const empreendimentos = useMemo(() => Array.from(new Map(leads.map((lead) => [lead.empreendimentoId, lead.empreendimentoNome || 'Empreendimento'])).entries()), [leads]);
    const filtered = useMemo(() => leads.filter((lead) => {
        const term = search.trim().toLowerCase();
        return (filterStatus === 'todos' || lead.status === filterStatus)
            && (filterEmp === 'todos' || lead.empreendimentoId === filterEmp)
            && (!term || `${lead.nome} ${lead.telefone} ${lead.email || ''}`.toLowerCase().includes(term));
    }), [leads, filterStatus, filterEmp, search]);

    return <div className="cockpit-shell max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        <div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Operação ao vivo</p><h1 className="text-[28px] font-extrabold tracking-[-.04em]">Todos os leads</h1><p className="text-text-secondary text-sm mt-2">{loading ? 'Carregando leads...' : `${filtered.length} lead${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`}</p></div>
        <Card className="p-4"><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 text-text-muted"><Filter size={16} /><span className="text-sm font-medium">Filtros:</span></div><div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><input type="text" placeholder="Nome, telefone ou e-mail..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 w-full sm:w-56" /></div><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as LeadStatus | 'todos')} className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5"><option value="todos">Todos os status</option>{statusOptions.slice(1).map((status) => <option key={status} value={status}>{statusLabels[status as LeadStatus]}</option>)}</select><select value={filterEmp} onChange={(event) => setFilterEmp(event.target.value)} className="text-sm rounded-lg border border-border bg-bg px-3 py-1.5"><option value="todos">Todos os empreendimentos</option>{empreendimentos.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></div></Card>
        {error && <Card className="p-4 border-red-200 bg-red-50 text-sm text-red-700">Não foi possível carregar os leads: {error}</Card>}
        <Card className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[650px]"><thead><tr className="border-b border-border text-left bg-black/[0.02]"><th className="px-4 py-3 text-text-muted font-medium">Lead</th><th className="px-4 py-3 text-text-muted font-medium">Empreendimento</th><th className="px-4 py-3 text-text-muted font-medium">Status</th><th className="px-4 py-3 text-text-muted font-medium">Recebido em</th></tr></thead><tbody>{!loading && filtered.map((lead) => <tr key={lead.id} className="border-b border-border/50 hover:bg-black/[0.02]"><td className="px-4 py-3"><p className="font-medium">{lead.nome}</p><p className="text-xs text-text-muted">{lead.telefone}{lead.email ? ` · ${lead.email}` : ''}</p></td><td className="px-4 py-3 text-text-secondary">{lead.empreendimentoNome || 'Não informado'}</td><td className="px-4 py-3"><StatusBadge status={lead.status} /></td><td className="px-4 py-3 text-text-secondary">{new Date(lead.criadoEm).toLocaleString('pt-BR')}</td></tr>)}</tbody></table></div>{!loading && filtered.length === 0 && <div className="text-center py-12"><p className="font-semibold">Nenhum lead ainda.</p><p className="text-sm text-text-secondary mt-1">Os leads recebidos pelo webhook aparecerão nesta lista.</p></div>}</Card>
    </div>;
}

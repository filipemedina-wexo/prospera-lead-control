import { Phone, AlertCircle, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import {
    leads,
    getEmpreendimento,
    statusLabels,
    type Lead,
    type LeadStatus,
} from '../../data/mockData';

const CORRETOR_ID = 'cor-1';

const STATUS_GROUPS: { status: LeadStatus; color: string }[] = [
    { status: 'novo',            color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { status: 'em_atendimento',  color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { status: 'contatado',       color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { status: 'visita_marcada',  color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { status: 'proposta',        color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { status: 'venda',           color: 'text-green-600 bg-green-50 border-green-200' },
    { status: 'perdido',         color: 'text-slate-500 bg-slate-50 border-slate-200' },
];

export function MeusLeads() {
    const { setCurrentPage, setSelectedLeadId } = useApp();

    const meusLeads = leads.filter(l => l.corretorId === CORRETOR_ID);
    const pendentes = meusLeads.filter(l => l.status === 'novo').length;

    const openLead = (lead: Lead) => {
        setSelectedLeadId(lead.id);
        setCurrentPage('lead-detalhe');
    };

    const groups = STATUS_GROUPS
        .map(g => ({
            ...g,
            leads: meusLeads
                .filter(l => l.status === g.status)
                .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()),
        }))
        .filter(g => g.leads.length > 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meus Leads</h1>
                <p className="text-text-secondary text-sm mt-1">{meusLeads.length} leads atribuídos — João Mendes</p>
            </div>

            {/* Status summary bar */}
            <div className="flex flex-wrap gap-2">
                {groups.map(g => (
                    <span key={g.status} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${g.color}`}>
                        <span className="font-bold">{g.leads.length}</span>
                        {statusLabels[g.status]}
                    </span>
                ))}
            </div>

            {pendentes > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        Você tem <span className="font-bold">{pendentes}</span> lead{pendentes > 1 ? 's' : ''} aguardando primeiro contato!
                    </p>
                </div>
            )}

            <div className="space-y-8">
                {groups.map(group => (
                    <div key={group.status}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${group.color}`}>
                                {group.leads.length}
                            </span>
                            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                                {statusLabels[group.status]}
                            </h2>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="space-y-2">
                            {group.leads.map(lead => {
                                const emp = getEmpreendimento(lead.empreendimentoId);
                                const timeAgo = getTimeAgo(new Date(lead.criadoEm));

                                return (
                                    <Card
                                        key={lead.id}
                                        variant="hover"
                                        className="p-4 cursor-pointer"
                                        onClick={() => openLead(lead)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0 font-bold text-sm text-brand">
                                                    {lead.nome.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{lead.nome}</p>
                                                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                                        <span>{emp?.nome}</span>
                                                        <span>·</span>
                                                        <span>{timeAgo}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={`tel:${lead.telefone}`}
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand hover:bg-brand hover:text-white transition-colors"
                                                >
                                                    <Phone size={14} />
                                                </a>
                                                <a
                                                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                                                >
                                                    <MessageCircle size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
}

import { Phone, AlertCircle, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import {
    leads,
    getEmpreendimento,
    type Lead,
} from '../../data/mockData';

// Simula visão do corretor João Mendes (cor-1)
const CORRETOR_ID = 'cor-1';

export function MeusLeads() {
    const { setCurrentPage, setSelectedLeadId } = useApp();

    const meusLeads = leads
        .filter(l => l.corretorId === CORRETOR_ID)
        .sort((a, b) => {
            // Novos primeiro, depois por data
            if (a.status === 'novo' && b.status !== 'novo') return -1;
            if (a.status !== 'novo' && b.status === 'novo') return 1;
            return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
        });

    const pendentes = meusLeads.filter(l => l.status === 'novo').length;

    const openLead = (lead: Lead) => {
        setSelectedLeadId(lead.id);
        setCurrentPage('lead-detalhe');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meus Leads</h1>
                <p className="text-text-secondary text-sm mt-1">{meusLeads.length} leads atribuídos — João Mendes</p>
            </div>

            {pendentes > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        Você tem <span className="font-bold">{pendentes}</span> lead{pendentes > 1 ? 's' : ''} aguardando primeiro contato!
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {meusLeads.map(lead => {
                    const emp = getEmpreendimento(lead.empreendimentoId);
                    const isNew = lead.status === 'novo';
                    const createdAt = new Date(lead.criadoEm);
                    const timeAgo = getTimeAgo(createdAt);

                    return (
                        <Card
                            key={lead.id}
                            variant="hover"
                            className={`p-4 cursor-pointer ${isNew ? 'border-amber-300 bg-amber-50/30' : ''}`}
                            onClick={() => openLead(lead)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${isNew ? 'bg-amber-100 text-amber-700' : 'bg-brand/10 text-brand'
                                        }`}>
                                        {lead.nome.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{lead.nome}</p>
                                        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                            <span>{emp?.nome}</span>
                                            <span>•</span>
                                            <span>{timeAgo}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
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
                                        title="Chamar no WhatsApp"
                                    >
                                        <MessageCircle size={14} />
                                    </a>
                                    <StatusBadge status={lead.status} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
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

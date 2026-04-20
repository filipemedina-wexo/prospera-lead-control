
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { leads } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export function PriorityLeadList() {
    const { setSelectedLeadId, setCurrentPage } = useApp();

    // Filter priority leads:
    // 1. Status 'novo' (New leads)
    // 2. SLA warning or breached (simplified logic here based on mock data)
    // For this demo, we'll just take 'novo' and 'visita_marcada' as priority, or random ones.
    // In a real app, this would be computed.
    // Let's take leads with status 'novo' or 'visita_marcada' or specific IDs.

    const priorityLeads = leads
        .filter(l => ['novo', 'visita_marcada', 'proposta'].includes(l.status))
        .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
        .slice(0, 5);

    const handleLeadClick = (leadId: string) => {
        setSelectedLeadId(leadId);
        setCurrentPage('lead-detalhe');
    };

    return (
        <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertCircle className="text-brand" size={20} />
                    <h2 className="text-lg font-semibold">Leads Prioritários</h2>
                </div>
                <button
                    onClick={() => setCurrentPage('meus-leads')}
                    className="text-sm text-brand font-medium hover:underline flex items-center gap-1"
                >
                    Ver todos <ArrowRight size={14} />
                </button>
            </div>

            <div className="space-y-4">
                {priorityLeads.map(lead => (
                    <div
                        key={lead.id}
                        onClick={() => handleLeadClick(lead.id)}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-brand/30 hover:bg-brand/5 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center text-sm font-bold text-text-secondary group-hover:bg-brand group-hover:text-white transition-colors">
                                {lead.nome.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary">{lead.nome}</h3>
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(lead.criadoEm).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <StatusBadge status={lead.status} />
                            <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}

                {priorityLeads.length === 0 && (
                    <div className="text-center py-10 text-text-muted">
                        Nenhum lead prioritário no momento.
                    </div>
                )}
            </div>
        </Card>
    );
}

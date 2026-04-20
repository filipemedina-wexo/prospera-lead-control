import { Building2, MapPin, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import {
    leads,
    empreendimentos,
    type Empreendimento,
} from '../../data/mockData';

// Simula visão do corretor João Mendes (cor-1)
const CORRETOR_ID = 'cor-1';

export function MeusEmpreendimentos() {
    const { setCurrentPage, setSelectedEmpreendimentoId } = useApp();

    // Empreendimentos em que o corretor tem leads atribuídos
    const meusLeads = leads.filter(l => l.corretorId === CORRETOR_ID);
    const empIds = [...new Set(meusLeads.map(l => l.empreendimentoId))];
    const meusEmpreendimentos = empIds
        .map(id => empreendimentos.find(e => e.id === id))
        .filter((e): e is Empreendimento => !!e);

    const getLeadCount = (empId: string) => meusLeads.filter(l => l.empreendimentoId === empId).length;
    const getActiveLeads = (empId: string) => meusLeads.filter(l => l.empreendimentoId === empId && l.status !== 'perdido').length;

    const handleOpenEmpreendimento = (id: string) => {
        setSelectedEmpreendimentoId(id);
        setCurrentPage('empreendimento-detalhe');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meus Empreendimentos</h1>
                <p className="text-text-secondary text-sm mt-1">
                    Empreendimentos nos quais você está atuando — {meusEmpreendimentos.length} no total
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meusEmpreendimentos.map(emp => {
                    const totalLeads = getLeadCount(emp.id);
                    const activeLeads = getActiveLeads(emp.id);

                    return (
                        <Card
                            key={emp.id}
                            className="overflow-hidden group cursor-pointer hover:border-brand/50 transition-colors"
                            onClick={() => handleOpenEmpreendimento(emp.id)}
                        >
                            {/* Image or gradient header */}
                            <div className="h-32 bg-gradient-to-br from-brand/20 via-brand/10 to-brand-accent/10 flex items-center justify-center relative">
                                <Building2 size={40} className="text-brand/40" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-base">{emp.nome}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                                    <MapPin size={12} />
                                    <span>{emp.cidade}</span>
                                </div>

                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={14} className="text-text-muted" />
                                        <span className="text-sm">
                                            <span className="font-semibold text-text-primary">{activeLeads}</span>
                                            <span className="text-text-muted"> ativos</span>
                                        </span>
                                    </div>
                                    <span className="text-text-muted">•</span>
                                    <span className="text-xs text-text-muted">{totalLeads} leads no total</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {meusEmpreendimentos.length === 0 && (
                <Card className="p-8 text-center">
                    <Building2 size={40} className="mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary">Nenhum empreendimento atribuído no momento.</p>
                </Card>
            )}
        </div>
    );
}

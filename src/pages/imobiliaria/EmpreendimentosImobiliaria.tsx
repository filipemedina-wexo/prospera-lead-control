import { Building2, MapPin, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
// import { useApp } from '../../context/AppContext';
import {
    leads,
    empreendimentos,
    type Empreendimento,
} from '../../data/mockData';

// Simula visão da Imobiliária Prime (imob-1)
const IMOBILIARIA_ID = 'imob-1';

export function EmpreendimentosImobiliaria() {
    // We can reuse the same detail logic if it works for Imobiliaria too
    // For now, let's just show the list.
    // If clicking needs to go to a detail view, we might need a specific route or reuse 'empreendimento-detalhe' if compatible.
    // The user didn't ask for a detail view, but "MeusEmpreendimentos" has it.
    // I'll assume they want the same behavior.

    // Note: App.tsx routes 'empreendimento-detalhe' only for 'corretor' profile currently. 
    // I might need to add it for 'imobiliaria' too if I want click to work.

    // const { setCurrentPage, setSelectedEmpreendimentoId } = useApp();

    // Empreendimentos em que a imobiliária tem leads
    const leadsDaImobiliaria = leads.filter(l => l.imobiliariaId === IMOBILIARIA_ID);
    const empIds = [...new Set(leadsDaImobiliaria.map(l => l.empreendimentoId))];
    const listaEmpreendimentos = empIds
        .map(id => empreendimentos.find(e => e.id === id))
        .filter((e): e is Empreendimento => !!e);

    const getLeadCount = (empId: string) => leadsDaImobiliaria.filter(l => l.empreendimentoId === empId).length;
    const getActiveLeads = (empId: string) => leadsDaImobiliaria.filter(l => l.empreendimentoId === empId && l.status !== 'perdido').length;

    /*
    const handleOpenEmpreendimento = (id: string) => {
        console.log("Open detail:", id);
    }
    */

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Empreendimentos da Imobiliária</h1>
                <p className="text-text-secondary text-sm mt-1">
                    Empreendimentos com atuação ativa — {listaEmpreendimentos.length} no total
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listaEmpreendimentos.map(emp => {
                    const totalLeads = getLeadCount(emp.id);
                    const activeLeads = getActiveLeads(emp.id);

                    return (
                        <Card
                            key={emp.id}
                            className="overflow-hidden group hover:border-brand/50 transition-colors"
                        // onClick={() => handleOpenEmpreendimento(emp.id)} 
                        >
                            {/* Image or gradient header */}
                            <div className="h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-brand/10 flex items-center justify-center relative">
                                <Building2 size={40} className="text-indigo-400" />
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
                                    <span className="text-xs text-text-muted">{totalLeads} leads</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {listaEmpreendimentos.length === 0 && (
                <Card className="p-8 text-center">
                    <Building2 size={40} className="mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary">Nenhum empreendimento com leads no momento.</p>
                </Card>
            )}
        </div>
    );
}

import { MapPin, Plus, Hash } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { empreendimentos, leads } from '../../data/mockData';

export function Empreendimentos() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Empreendimentos</h1>
                    <p className="text-text-secondary text-sm mt-1">{empreendimentos.length} empreendimentos cadastrados</p>
                </div>
                <Button className="self-start sm:self-auto">
                    <Plus size={16} className="mr-2" />
                    Novo Empreendimento
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {empreendimentos.map(emp => {
                    const empLeads = leads.filter(l => l.empreendimentoId === emp.id);
                    const novos = empLeads.filter(l => l.status === 'novo').length;
                    const vendas = empLeads.filter(l => l.status === 'venda').length;

                    return (
                        <Card key={emp.id} variant="hover" className="p-6 cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                                    <MapPin size={20} />
                                </div>
                                <span className="text-xs bg-black/5 text-text-muted px-2 py-0.5 rounded-full">
                                    {empLeads.length} leads
                                </span>
                            </div>

                            <h3 className="font-semibold text-base mb-1">{emp.nome}</h3>
                            <p className="text-sm text-text-secondary mb-4">{emp.cidade}</p>

                            <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                                    {novos} novos
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400" />
                                    {vendas} vendas
                                </span>
                            </div>

                            <div className="border-t border-border pt-3">
                                <p className="text-xs text-text-muted mb-1.5 flex items-center gap-1">
                                    <Hash size={12} />
                                    Form IDs associados:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {emp.formIds.map(f => (
                                        <span key={f} className="text-xs bg-black/5 text-text-secondary px-2 py-0.5 rounded font-mono">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { Plus, Search, Building2, MapPin, MoreVertical, Edit2, BarChart2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { empreendimentos } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export function GestaoEmpreendimentos() {
    const { setCurrentPage } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = empreendimentos.filter(emp => 
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Empreendimentos</h1>
                    <p className="text-text-secondary mt-1">Gestão de produtos, tabelas e material de vendas.</p>
                </div>
                <Button className="shrink-0 gap-2" onClick={() => setCurrentPage('novo-empreendimento')}>
                    <Plus size={18} />
                    Novo Empreendimento
                </Button>
            </div>

            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="pb-3 px-4 font-semibold text-sm text-text-secondary">Nome do Empreendimento</th>
                                <th className="pb-3 px-4 font-semibold text-sm text-text-secondary">Localização</th>
                                <th className="pb-3 px-4 font-semibold text-sm text-text-secondary">Status da Obra</th>
                                <th className="pb-3 px-4 font-semibold text-sm text-text-secondary">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((emp) => (
                                <tr key={emp.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                                                {emp.imagens && emp.imagens.length > 0 ? (
                                                    <img src={emp.imagens[0]} className="w-full h-full object-cover rounded-lg" alt={emp.nome} />
                                                ) : (
                                                    <Building2 className="text-brand" size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{emp.nome}</p>
                                                <p className="text-xs text-text-muted mt-0.5">{emp.formIds.length} forms conectados</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                                            <MapPin size={14} className="text-text-muted" />
                                            {emp.cidade}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                            emp.statusObra === 'lancamento' ? 'bg-brand/10 text-brand border-brand/20' :
                                            emp.statusObra === 'em_obras' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {emp.statusObra === 'lancamento' ? 'Lançamento' :
                                             emp.statusObra === 'em_obras' ? 'Em Obras' : 'Pronto'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" className="p-2 h-auto text-text-muted hover:text-brand" onClick={() => setCurrentPage('novo-empreendimento')}>
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button variant="ghost" className="p-2 h-auto text-text-muted hover:text-brand">
                                                <BarChart2 size={16} />
                                            </Button>
                                            <Button variant="ghost" className="p-2 h-auto text-text-muted hover:text-text-primary">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Building2 className="mx-auto h-12 w-12 text-text-muted opacity-20 mb-4" />
                            <h3 className="text-lg font-medium text-text-secondary">Nenhum empreendimento.</h3>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

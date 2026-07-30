import { useState } from 'react';
import { Search, MapPin, Building2, TrendingUp, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { empreendimentos } from '../../data/mockData';

export function CatalogoEmpreendimentos() {
    const { setCurrentPage } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = empreendimentos.filter(emp =>
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Hero Vitrine */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand opacity-10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Hub de Vendas</h1>
                    <p className="text-slate-300 text-lg">
                        Todo o material que você precisa para encantar seu cliente e fechar vendas mais rápido. Acesse plantas, tabelas e books em alta resolução.
                    </p>
                </div>
                
                <div className="relative z-10 mt-8 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por empreendimento ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Grid de Projetos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(emp => (
                    <div key={emp.id} className="group bg-bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand/30 transition-all hover:shadow-xl hover:shadow-brand/5 flex flex-col">
                        <div className="relative h-64 overflow-hidden bg-slate-100">
                            {emp.imagens && emp.imagens[0] ? (
                                <img 
                                    src={emp.imagens[0]} 
                                    alt={emp.nome} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Building2 size={64} />
                                </div>
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                                    emp.statusObra === 'lancamento' ? 'bg-brand/90 text-white border-white/20' :
                                    emp.statusObra === 'em_obras' ? 'bg-black/70 text-white border-white/20' :
                                    'bg-white/90 text-slate-900 border-black/10'
                                }`}>
                                    {emp.statusObra === 'lancamento' ? '🚀 Lançamento' :
                                     emp.statusObra === 'em_obras' ? '🏗️ Em Obras' : '🔑 Pronto'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-xl font-bold line-clamp-1">{emp.nome}</h3>
                            </div>
                            
                            <div className="flex items-center text-text-secondary text-sm mb-4 gap-1.5">
                                <MapPin size={14} className="text-brand" />
                                <span className="line-clamp-1">{emp.cidade} • {emp.localizacao?.bairro}</span>
                            </div>

                            {/* Features Specs */}
                            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                                <div className="bg-black/[0.03] rounded-lg py-2 px-1">
                                    <p className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Metragem</p>
                                    <p className="text-xs font-semibold">{emp.tipologias?.[0]?.area || '--'}</p>
                                </div>
                                <div className="bg-black/[0.03] rounded-lg py-2 px-1">
                                    <p className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Dorms</p>
                                    <p className="text-xs font-semibold">{emp.tipologias?.[0]?.dormitorios || '--'}</p>
                                </div>
                                <div className="bg-black/[0.03] rounded-lg py-2 px-1">
                                    <p className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Vagas</p>
                                    <p className="text-xs font-semibold">{emp.tipologias?.[0]?.vagas || '--'}</p>
                                </div>
                            </div>

                            {/* Footer do Card */}
                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-brand text-sm font-semibold">
                                    <TrendingUp size={16} />
                                    <span>{emp.comissao || 'Consulte'}</span>
                                </div>
                                <Button onClick={() => setCurrentPage('empreendimento-detalhe')} className="rounded-xl ring-0 hover:ring-0">
                                    Acessar Material
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-bg-surface border border-border rounded-3xl">
                    <Building2 className="mx-auto h-16 w-16 text-text-muted opacity-20 mb-4" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">Nenhum projeto encontrado.</h3>
                    <p className="text-text-secondary max-w-sm mx-auto">Não encontramos nenhum empreendimento com este nome ou cidade.</p>
                </div>
            )}
        </div>
    );
}

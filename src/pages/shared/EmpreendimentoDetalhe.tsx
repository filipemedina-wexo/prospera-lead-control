import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { 
    ArrowLeft, MapPin, Download, CheckCircle2, 
    Share2, Building2, PlayCircle, Star, Image as ImageIcon
} from 'lucide-react';
import { empreendimentos } from '../../data/mockData';

// For demo purposes, we automatically load the first "Lançamento" rich instance. 
// In a real app we'd pass an ID.
export function EmpreendimentoDetalhe() {
    const { setCurrentPage } = useApp();
    const emp = empreendimentos.find(e => e.id === 'emp-1') || empreendimentos[0];

    const [activeTab, setActiveTab] = useState<'info' | 'material' | 'galeria'>('info');

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
            
            {/* Nav Back */}
            <button 
                onClick={() => setCurrentPage('empreendimentos')}
                className="flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors group cursor-pointer"
            >
                <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar para o hub principal
            </button>

            {/* Header Hero */}
            <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-slate-900 group">
                {emp.imagens && emp.imagens[0] ? (
                    <img src={emp.imagens[0]} alt={emp.nome} className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20"><Building2 size={120} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                    <div className="flex gap-3 mb-4">
                        <span className="bg-brand/20 backdrop-blur-md border border-brand/40 text-brand-light px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Star size={14} fill="currentColor" /> {emp.comissao || 'Consulte'}
                        </span>
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {emp.statusObra === 'lancamento' ? 'Lançamento' : 'Obras Aceleradas'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{emp.nome}</h1>
                    <p className="flex items-center gap-2 text-lg text-slate-300">
                        <MapPin size={18} className="text-brand" /> 
                        {emp.localizacao?.endereco} - {emp.localizacao?.bairro}, {emp.cidade}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'info' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                >
                    Ficha Técnica completa
                </button>
                <button 
                    onClick={() => setActiveTab('galeria')}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'galeria' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                >
                    Galeria de Fotos
                </button>
                <button 
                    onClick={() => setActiveTab('material')}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'material' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                >
                    Material de Vendas (Downloads)
                </button>
            </div>

            {/* TAB: Info */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pt-4">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sobre o Projeto</h2>
                            <p className="text-text-secondary leading-relaxed text-lg">{emp.descricao}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Diferenciais do Imóvel</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {emp.diferenciais?.map((dif, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-black/[0.02] p-4 rounded-xl border border-border">
                                        <CheckCircle2 size={20} className="text-brand shrink-0 mt-0.5" />
                                        <span className="text-text-secondary font-medium">{dif}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Itens de Lazer</h2>
                            <div className="flex flex-wrap gap-2">
                                {emp.itensLazer?.map((item, i) => (
                                    <span key={i} className="bg-bg-surface border border-border px-4 py-2 rounded-full text-sm font-medium text-text-secondary">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-brand" /> Ficha Técnica
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(emp.fichaTecnica || {}).map(([key, value]) => {
                                    if (!value) return null;
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                                    return (
                                        <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 last:pb-0">
                                            <span className="text-text-muted text-sm">{formattedKey}</span>
                                            <span className="font-semibold text-sm text-right">{value}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                        
                        <Card className="p-6 bg-gradient-to-br from-brand/10 to-transparent border-brand/20">
                            <h3 className="text-lg font-bold mb-4">Tipologias</h3>
                            <div className="space-y-3">
                                {emp.tipologias?.map((tipo, i) => (
                                    <div key={i} className="bg-white p-3 rounded-lg border border-border flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-sm">{tipo.nome}</p>
                                            <p className="text-xs text-text-muted">{tipo.area} • {tipo.dormitorios} dorms</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-muted">A partir de</p>
                                            <p className="font-bold text-brand">R$ {(tipo.precoEstimado || 0).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB: Material de Apoio */}
            {activeTab === 'material' && (
                <div className="animate-fade-in pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Static helper boxes for real-estate sales logic */}
                        <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer hover:border-brand/40 hover:shadow-lg transition-all">
                            <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                                <Share2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Copys para WhatsApp</h3>
                            <p className="text-sm text-text-muted mb-6">Textos de quebra-gelo desenhados para você usar no clique com o cliente.</p>
                            <Button variant="outline" className="w-full mt-auto">Copiar Textos</Button>
                        </div>

                        {emp.documentos?.map((doc, i) => (
                            <div key={i} className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer hover:border-brand/40 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:text-brand group-hover:bg-brand/10">
                                    {doc.tipo === 'pdf' ? <Download size={32} /> : <PlayCircle size={32} />}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{doc.nome}</h3>
                                <p className="text-sm text-text-muted mb-6">Arquivo atualizado e homologado pela incorporadora.</p>
                                <Button className="w-full mt-auto">{doc.tipo === 'pdf' ? 'Baixar Arquivo' : 'Acessar Link'}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: Galeria */}
            {activeTab === 'galeria' && (
                <div className="animate-fade-in pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {emp.imagens?.map((img, i) => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden cursor-pointer group relative">
                                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <ImageIcon size={32} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

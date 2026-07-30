import { useState } from 'react';
import { Megaphone, Plus, BellRing, Search, Calendar, ChevronRight } from 'lucide-react';
import { avisosGlobais, type Aviso } from '../../data/mockData';

export function AvisosIncorporadora() {
    const [avisos, setAvisos] = useState<Aviso[]>(avisosGlobais);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAvisos = avisos.filter(a =>
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Central de Avisos</h1>
                    <p className="text-text-secondary mt-1">
                        Gerencie comunicados e informativos para a sua rede de corretores e imobiliárias parceiras.
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex justify-center items-center gap-2 px-4 py-2 bg-lvl-gold text-lvl-black font-semibold rounded-lg shadow-[0_4px_14px_0_rgba(198,168,124,0.39)] hover:shadow-[0_6px_20px_rgba(198,168,124,0.23)] hover:scale-105 transition-all w-full md:w-auto"
                >
                    <Plus size={18} />
                    <span>Novo Aviso</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Historico List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg text-text-primary">Avisos Recentes</h2>
                            <div className="relative w-64 hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar aviso..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredAvisos.map(aviso => (
                                <div key={aviso.id} className="p-4 rounded-xl border border-border bg-bg hover:border-lvl-gold/30 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center shrink-0">
                                                <Megaphone size={18} className="text-lvl-gold" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-text-primary group-hover:text-lvl-gold transition-colors">
                                                    {aviso.titulo}
                                                </h3>
                                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                                                    {aviso.mensagem}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(aviso.dataCriacao).toLocaleDateString()}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-[10px] uppercase font-semibold">
                                                        Destino: {aviso.audiencia.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Box */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-lvl-gold/20 rounded-xl p-6 shadow-[0_0_15px_rgba(198,168,124,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lvl-gold/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <BellRing size={24} className="text-lvl-gold mb-3" />
                        <h2 className="text-lg font-bold text-white mb-2">Comunicação é tudo</h2>
                        <p className="text-sm text-white/70 mb-4">
                            Mantenha seus parceiros de vendas engajados. Avisos com dicas de vendas e atualizações de produtos aceleram as conversões em até 15%.
                        </p>
                        <div className="pt-4 border-t border-lvl-gold/20 flex gap-4">
                            <div>
                                <div className="text-2xl font-bold text-lvl-gold">24</div>
                                <div className="text-xs text-white/60 uppercase tracking-wider">Avisos no Mês</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-lvl-gold">2k+</div>
                                <div className="text-xs text-white/60 uppercase tracking-wider">Visualizações</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Novo Aviso */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-bg-surface w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-slide-up border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text-primary">Novo Aviso</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-text-muted hover:text-text-primary">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Título do Aviso</label>
                                <input type="text" className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text-primary" placeholder="Ex: Nova Tabela de Preços" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Para quem deseja enviar?</label>
                                <select className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text-primary">
                                    <option value="todos">Todos (Rede Inteira)</option>
                                    <option value="imobiliaria_especifica">Imobiliária Específica</option>
                                    <option value="corretores">Apenas Corretores</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Mensagem</label>
                                <textarea className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text-primary h-32 resize-none" placeholder="Escreva o comunicado aqui..."></textarea>
                            </div>
                            <div className="bg-bg p-4 rounded-lg flex items-start gap-3 border border-border mt-4">
                                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                                    <BellRing size={16} />
                                </div>
                                <div className="text-sm text-text-secondary">
                                    Ao publicar, todos os destinatários receberão uma notificação no aplicativo e um alerta por e-mail no final do dia.
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-bg/50">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-text-secondary font-medium hover:bg-black/5 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors shadow-md">
                                Publicar Aviso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

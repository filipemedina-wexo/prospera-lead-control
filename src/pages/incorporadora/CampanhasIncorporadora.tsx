import { useState } from 'react';
import { Trophy, Plus, Settings, Search, Play, Users, CalendarDays, Gift, ChevronRight, X, AlertCircle, Image as ImageIcon, CheckSquare, Square, Pencil } from 'lucide-react';
import { listaCampanhas, type Campanha } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export function CampanhasIncorporadora() {
    const { setCurrentPage, setSelectedCampanhaId } = useApp();
    const [campanhas] = useState<Campanha[]>([
        ...listaCampanhas,
        {
            id: 'camp-3',
            titulo: 'Mega Prêmio de Inverno',
            descricao: 'Campanha de visitas realizadas durante o inverno.',
            metaPontos: 0,
            regra: { tipo: 'ranking', metrica: 'visitas', alvo: 10 },
            premio: 'Viagem para o Chile',
            quantidadePremios: 3,
            dataInicio: '2023-06-01T00:00:00Z',
            dataFim: '2023-08-31T23:59:59Z',
            ativa: true,
            empreendimentoId: 'all'
        },
        {
            id: 'camp-4',
            titulo: 'Esquenta Black Friday',
            descricao: 'Aquecimento Rascunho',
            metaPontos: 0,
            regra: { tipo: 'atingiu_ganhou', metrica: 'vendas', alvo: 1 },
            premio: 'TV 65"',
            dataInicio: '2023-11-01T00:00:00Z',
            dataFim: '2023-11-30T23:59:59Z',
            ativa: false,
            empreendimentoId: 'emp-1'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'ativos' | 'rascunho' | 'concluidos'>('ativos');

    // Form states para UX Wizard (Agora com 4 Passos)
    const [formStep, setFormStep] = useState(1);
    const [formTipo, setFormTipo] = useState<'atingiu_ganhou' | 'sorteio_cotas' | 'ranking'>('sorteio_cotas');
    const [modalidadeParticipante, setModalidadeParticipante] = useState<'corretor' | 'imobiliaria'>('corretor');
    const [previewNome, setPreviewNome] = useState('');
    const [previewPremio, setPreviewPremio] = useState('');
    const [selectedImob, setSelectedImob] = useState<string[]>([]);
    
    // Lista mock de imobiliárias para o passo de Público
    const imobiliariasList = [
        { id: '1', nome: 'Imobiliária Prime' },
        { id: '2', nome: 'Rede Lares' },
        { id: '3', nome: 'Casa & Cia' },
        { id: '4', nome: 'Lopes Elite' }
    ];

    const now = new Date();

    const getStatusType = (c: Campanha): 'ativos' | 'rascunho' | 'concluidos' => {
        if (!c.ativa) return 'rascunho';
        if (new Date(c.dataFim) < now) return 'concluidos';
        return 'ativos';
    };

    const filteredCampanhas = campanhas.filter(c => {
        const matchesTerm = c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || c.premio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = getStatusType(c) === activeTab;
        return matchesTerm && matchesTab;
    });

    const openWizard = (draftCampanha?: Campanha) => {
        if (draftCampanha) {
            setPreviewNome(draftCampanha.titulo);
            setPreviewPremio(draftCampanha.premio);
            setFormTipo(draftCampanha.regra?.tipo || 'sorteio_cotas');
        } else {
            setPreviewNome('');
            setPreviewPremio('');
            setFormTipo('sorteio_cotas');
            setFormStep(1);
        }
        setIsFormOpen(true);
    };

    const closeModal = () => {
        setIsFormOpen(false);
        setFormStep(1);
        setPreviewNome('');
        setPreviewPremio('');
    };

    const handleViewDetails = (id: string) => {
        setSelectedCampanhaId(id);
        setCurrentPage('campanha-detalhe');
    };

    const toggleImob = (id: string) => {
        setSelectedImob(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Padronizado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Campanhas de Incentivo</h1>
                    <p className="text-text-secondary mt-1">
                        Gerencie desafios, prêmios e sorteios para impulsionar as vendas da sua rede.
                    </p>
                </div>
                <button
                    onClick={() => openWizard()}
                    className="flex justify-center items-center gap-2 px-4 py-2 bg-lvl-gold text-lvl-black font-semibold rounded-lg shadow-[0_4px_14px_0_rgba(198,168,124,0.39)] hover:shadow-[0_6px_20px_rgba(198,168,124,0.23)] hover:scale-105 transition-all w-full md:w-auto"
                >
                    <Plus size={18} />
                    <span>Criar Campanha</span>
                </button>
            </div>

            {/* Area de Busca e Tabs */}
            <div className="bg-bg-surface border border-border rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="flex bg-bg p-1 rounded-lg border border-border w-full md:w-auto overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('ativos')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'ativos' ? 'bg-bg-surface border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Em Andamento
                    </button>
                    <button 
                        onClick={() => setActiveTab('concluidos')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'concluidos' ? 'bg-bg-surface border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Concluídos
                    </button>
                    <button 
                        onClick={() => setActiveTab('rascunho')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === 'rascunho' ? 'bg-bg-surface border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Rascunhos
                    </button>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou prêmio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:border-lvl-gold focus:ring-1 focus:ring-lvl-gold outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid de Campanhas Bento-style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampanhas.map(campanha => {
                    const isAtiva = activeTab === 'ativos';
                    const isSorteio = campanha.regra?.tipo === 'sorteio_cotas';
                    const isRascunho = activeTab === 'rascunho';

                    return (
                        <div key={campanha.id} className="group bg-bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-lvl-gold/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            {/* Card Image Area */}
                            <div className={`h-40 relative overflow-hidden flex items-center justify-center ${campanha.premioImagemUrl ? 'bg-slate-900' : 'bg-gradient-to-r from-bg-elevated to-bg'}`}>
                                {campanha.premioImagemUrl ? (
                                    <img src={campanha.premioImagemUrl} alt={campanha.premio} className={`w-full h-full object-cover transition-all duration-700 ${isAtiva ? 'opacity-80 group-hover:scale-105 group-hover:opacity-100' : 'opacity-40 grayscale blur-[1px]'}`} />
                                ) : (
                                    <Gift size={48} className="text-text-muted" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                
                                <div className="absolute top-4 left-4">
                                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full flex items-center gap-1.5 backdrop-blur-md border ${
                                        activeTab === 'ativos' 
                                            ? 'bg-brand/20 text-green-400 border-brand/50' 
                                        : activeTab === 'concluidos'
                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                            : 'bg-black/50 text-white/50 border-white/20'
                                    }`}>
                                        {activeTab === 'ativos' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                                        {activeTab === 'concluidos' && <Trophy size={10} />}
                                        {activeTab === 'ativos' ? 'No Ar' : activeTab === 'concluidos' ? 'Concluída' : 'Rascunho'}
                                    </span>
                                </div>

                                {isSorteio && isAtiva && (
                                    <button 
                                        onClick={() => setCurrentPage('sorteio')}
                                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-600/90 text-white rounded-full backdrop-blur-sm border border-red-400/50 hover:scale-110 hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                        title="Iniciar Sala de Sorteio"
                                    >
                                        <Play size={12} fill="currentColor" className="ml-0.5" />
                                    </button>
                                )}

                                <div className="absolute bottom-3 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white drop-shadow-md">{campanha.titulo}</h3>
                                    <p className="text-xs text-lvl-gold font-medium mt-0.5 max-w-full truncate">Prêmio: {campanha.premio}</p>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between bg-bg-surface">
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-xs text-text-secondary">
                                        <CalendarDays size={14} className="text-text-muted" />
                                        <span>Até {new Date(campanha.dataFim).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                        {campanha.descricao}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-bg-elevated rounded">
                                            {isSorteio ? <Users size={14} className="text-text-muted" /> : <Settings size={14} className="text-text-muted" />}
                                        </div>
                                        <span className="text-xs font-medium text-text-primary capitalize">
                                            {campanha.regra?.tipo.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    {isRascunho ? (
                                        <button 
                                            onClick={() => openWizard(campanha)}
                                            className="text-xs font-bold uppercase tracking-wider text-text-primary hover:text-lvl-gold flex items-center gap-1 transition-colors bg-bg border border-border px-3 py-1.5 rounded-lg"
                                        >
                                            <Pencil size={12} /> Editar
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleViewDetails(campanha.id)}
                                            className="text-xs font-bold uppercase tracking-wider text-lvl-gold hover:text-yellow-600 flex items-center gap-1 transition-colors"
                                        >
                                            Ver Métricas <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredCampanhas.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center border-2 border-dashed border-border rounded-xl">
                        <Gift size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-text-primary">Nenhuma campanha encontrada</h3>
                        <p className="text-sm text-text-secondary mt-1">Você não possui campanhas nesta aba com esses filtros.</p>
                    </div>
                )}
            </div>

            {/* Modal Wizard Expandido */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex animate-fade-in bg-black/60 backdrop-blur-sm p-4 md:p-6 lg:p-10 justify-center items-center">
                    
                    <div className="relative w-full max-w-6xl h-full max-h-[850px] bg-bg-surface rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-border animate-slide-up">
                        
                        <button onClick={closeModal} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-text-primary transition-colors">
                            <X size={18} />
                        </button>

                        {/* LEFT AREA: Formulário */}
                        <div className="w-full md:w-[60%] flex flex-col h-full bg-bg z-10 border-r border-border relative overflow-y-auto">
                            <div className="p-8 pb-4">
                                <div className="flex items-center gap-1.5 mb-1">
                                    {[1, 2, 3, 4].map(step => (
                                        <div key={step} className={`h-1.5 flex-1 rounded-full ${formStep >= step ? 'bg-lvl-gold' : 'bg-bg-elevated'}`} />
                                    ))}
                                </div>
                                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mt-6">Passo {formStep} de 4</h2>
                                <h3 className="text-2xl font-bold text-text-primary mt-1">
                                    {formStep === 1 && 'A Dinâmica Central'}
                                    {formStep === 2 && 'O Gatilho e a Regra'}
                                    {formStep === 3 && 'Público Alvo'}
                                    {formStep === 4 && 'Arte e Premiação'}
                                </h3>
                            </div>

                            <div className="px-8 pt-2 pb-8 flex-1">
                                
                                {/* PASSO 1: DINÂMICA */}
                                {formStep === 1 && (
                                    <div className="space-y-5 animate-fade-in">
                                        <p className="text-sm text-text-secondary mb-6">Qual será a natureza principal desta campanha de incentivo?</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <button onClick={() => setFormTipo('sorteio_cotas')} className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${formTipo === 'sorteio_cotas' ? 'border-lvl-gold bg-lvl-gold/5' : 'border-border bg-bg-surface hover:border-border/80'}`}>
                                                <div className={`p-3 rounded-lg shrink-0 ${formTipo === 'sorteio_cotas' ? 'bg-lvl-gold text-black' : 'bg-bg-elevated text-text-muted'}`}><Users size={24} /></div>
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-base">Sorteio por Cotas (Vidas)</h4>
                                                    <p className="text-xs text-text-secondary mt-1">Gera um bilhete virtual para cada meta batida. Ideal para o sorteio final ao vivo.</p>
                                                </div>
                                            </button>
                                            <button onClick={() => setFormTipo('atingiu_ganhou')} className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${formTipo === 'atingiu_ganhou' ? 'border-lvl-gold bg-lvl-gold/5' : 'border-border bg-bg-surface hover:border-border/80'}`}>
                                                <div className={`p-3 rounded-lg shrink-0 ${formTipo === 'atingiu_ganhou' ? 'bg-lvl-gold text-black' : 'bg-bg-elevated text-text-muted'}`}><Trophy size={24} /></div>
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-base">Atingiu, Ganhou</h4>
                                                    <p className="text-xs text-text-secondary mt-1">Atingiu a meta, garantiu o prêmio. Premiação direta sem sorteios.</p>
                                                </div>
                                            </button>
                                            <button onClick={() => setFormTipo('ranking')} className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${formTipo === 'ranking' ? 'border-lvl-gold bg-lvl-gold/5' : 'border-border bg-bg-surface hover:border-border/80'}`}>
                                                <div className={`p-3 rounded-lg shrink-0 ${formTipo === 'ranking' ? 'bg-lvl-gold text-black' : 'bg-bg-elevated text-text-muted'}`}><Settings size={24} /></div>
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-base">Top Ranking Aberto</h4>
                                                    <p className="text-xs text-text-secondary mt-1">Cria uma tabela de liderança gamificada exibida em tempo real para todos.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* PASSO 2: REGRAS */}
                                {formStep === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-sm text-blue-600 mb-6">
                                            <AlertCircle size={20} className="shrink-0" />
                                            <p>A plataforma audita o cumprimento de regras automaticamente em tempo real.</p>
                                        </div>
                                        
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-text-primary mb-2">Qual indicador gera a recompensa?</label>
                                                <select className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold text-sm font-medium">
                                                    <option value="vendas">Vendas Efetuadas (VGV)</option>
                                                    <option value="visitas">Visitas Registradas</option>
                                                    <option value="atendimentos">Atendimentos no Prazo (SLA)</option>
                                                    <option value="pontos">Pontos Acumulados</option>
                                                    <option value="leads_tratados">Novos Leads Tratados</option>
                                                    <option value="taxa_conversao">Taxa de Conversão (%)</option>
                                                </select>
                                                <p className="text-xs text-text-muted mt-2">Escolha a ação principal de funil que a rede deve focar.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-text-primary mb-2">Qual o alvo numérico (meta)?</label>
                                                    <input type="number" defaultValue="1" className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold" />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                                <div>
                                                    <label className="block text-sm font-semibold text-text-primary mb-2">Início e Término</label>
                                                    <input type="date" className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold text-sm text-text-secondary mb-2" />
                                                    <input type="date" className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold text-sm text-text-secondary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PASSO 3: PÚBLICO ALVO */}
                                {formStep === 3 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-text-primary mb-2">Esta Campanha premia o:</label>
                                                <div className="flex bg-bg-surface p-1 rounded-lg border border-border">
                                                    <button 
                                                        onClick={() => setModalidadeParticipante('corretor')}
                                                        className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${modalidadeParticipante === 'corretor' ? 'bg-bg border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                                    >
                                                        Corretor Individual
                                                    </button>
                                                    <button 
                                                        onClick={() => setModalidadeParticipante('imobiliaria')}
                                                        className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${modalidadeParticipante === 'imobiliaria' ? 'bg-bg border border-border text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                                    >
                                                        Time da Imobiliária
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                                                    Ao selecionar Corretor, a meta precisa ser batida pelo vendedor. Ao selecionar Imobiliária, os esforços se somam em nome do grupo.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm">
                                            <label className="block text-sm font-bold text-text-primary mb-4 pb-2 border-b border-border">Imobiliárias Elegíveis para Participação</label>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-lvl-gold/5 border border-lvl-gold/20 rounded-lg mb-4 hover:bg-lvl-gold/10 cursor-pointer transition-colors text-text-primary font-medium text-sm">
                                                <button onClick={() => setSelectedImob([])} className="text-lvl-gold hover:underline">
                                                    Marcar/Desmarcar Todas
                                                </button>
                                            </div>

                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {imobiliariasList.map(imob => {
                                                    const isSelected = selectedImob.includes(imob.id) || selectedImob.length === 0; // If 0, means all are selected conceptually for the mock
                                                    return (
                                                        <div key={imob.id} onClick={() => toggleImob(imob.id)} className="flex items-center gap-3 p-3 bg-bg border border-border rounded-lg hover:border-lvl-gold/50 cursor-pointer transition-all">
                                                            {isSelected ? <CheckSquare size={18} className="text-lvl-gold" /> : <Square size={18} className="text-text-muted" />}
                                                            <span className={`text-sm ${isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>{imob.nome}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PASSO 4: ARTE E PREMIAÇÃO */}
                                {formStep === 4 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-2">Nome de Impacto</label>
                                            <input type="text" placeholder="Ex: Aceleração de Verão" value={previewNome} onChange={e => setPreviewNome(e.target.value)} className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-2">Descrição da Campanha</label>
                                            <textarea rows={3} placeholder="Escreva as regras básicas ou uma mensagem motivadora." className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl resize-none focus:border-lvl-gold"></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-2">O Prêmio Master</label>
                                            <input type="text" placeholder="Ex: Viagem All-Inclusive para Cancún" value={previewPremio} onChange={e => setPreviewPremio(e.target.value)} className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl focus:border-lvl-gold font-medium" />
                                        </div>

                                        {/* File Upload Simulator */}
                                        <div className="mt-6 border-t border-border pt-6">
                                            <label className="block text-sm font-semibold text-text-primary mb-2">Banner da Campanha</label>
                                            <p className="text-xs text-text-muted mb-4 leading-relaxed">
                                                Recomendamos imagens com resolução de <strong className="text-text-secondary">1200x400 pixels</strong> (formato retangular de vitrine). Evite textos pesados sobre a imagem.
                                            </p>
                                            <div className="border-2 border-dashed border-border rounded-xl bg-bg-surface p-8 flex flex-col items-center justify-center text-center hover:border-lvl-gold/50 transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <ImageIcon size={24} className="text-lvl-gold" />
                                                </div>
                                                <h5 className="text-sm font-medium text-text-primary">Clique para fazer upload</h5>
                                                <p className="text-xs text-text-muted mt-1">PNG, JPG ou GIF (Max. 5MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Control Footer */}
                            <div className="p-8 pt-4 pb-8 flex justify-between border-t border-border bg-bg shrink-0">
                                <button onClick={() => formStep === 1 ? closeModal() : setFormStep(formStep - 1)} className="px-6 py-2.5 text-text-secondary font-bold hover:bg-black/5 rounded-xl transition-colors">{formStep === 1 ? 'Cancelar' : 'Voltar'}</button>
                                <button onClick={() => formStep === 4 ? closeModal() : setFormStep(formStep + 1)} className={`px-8 py-2.5 font-bold rounded-xl shadow-lg hover:scale-105 transition-all text-sm uppercase ${formStep === 4 ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 'bg-text-primary text-bg'}`}>
                                    {formStep === 4 ? 'Publicar Campanha' : 'Próxima'}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT AREA: Preview Ao Vivo */}
                        <div className="hidden md:flex w-[40%] bg-slate-900 border-l border-border/50 flex-col items-center justify-center p-10 relative overflow-hidden">
                            <h4 className="absolute top-8 left-8 text-xs font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" /> Live Preview
                            </h4>
                            
                            {/* O Card Simulado */}
                            <div className="w-full max-w-[320px] bg-slate-950 border border-lvl-gold/20 rounded-2xl overflow-hidden shadow-2xl scale-105 flex flex-col">
                                <div className="h-44 bg-slate-800 relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                                    <Gift size={48} className="text-white/10" />
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full bg-brand/20 text-green-400 border border-brand/50">Simulação</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-950 flex-1 border-t border-lvl-gold/10">
                                    <h3 className="text-xl font-bold text-white leading-tight">{previewNome || 'Título da Campanha'}</h3>
                                    <div className="text-sm font-medium text-lvl-gold mt-1 drop-shadow-md">Prêmio: {previewPremio || '???'}</div>
                                    <div className="bg-white/5 rounded-lg p-3 mt-5 border border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-white/50 uppercase font-semibold leading-relaxed">
                                            {formTipo.replace('_', ' ')} <br/>
                                            <span className="text-lvl-gold">{modalidadeParticipante === 'corretor' ? '(Individual)' : '(Em Grupo)'}</span>
                                        </span>
                                        <Trophy size={20} className="text-white/20" />
                                    </div>
                                </div>
                            </div>

                            <p className="absolute bottom-8 mt-4 text-[10px] text-white/30 tracking-widest uppercase font-semibold">Os corretores verão isso na dashboard</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

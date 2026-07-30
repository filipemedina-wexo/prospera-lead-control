import { useState, useMemo } from 'react';
import { ChevronLeft, Trophy, Users, CalendarDays, Gift, TrendingUp, CheckCircle2, Ticket, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { listaCampanhas } from '../../data/mockData';

export function CampanhaDetalhe() {
    const { setCurrentPage, selectedCampanhaId } = useApp();

    const campanha = useMemo(() => {
        let found = listaCampanhas.find(c => c.id === selectedCampanhaId);
        
        if (!found) {
            found = {
                id: selectedCampanhaId || 'camp-3',
                titulo: 'Mega Prêmio de Inverno',
                descricao: 'Campanha de visitas realizadas durante o inverno. Mostrou um engajamento 40% maior na rede.',
                metaPontos: 0,
                regra: { tipo: 'ranking', metrica: 'visitas', alvo: 10 },
                premio: 'Viagem para o Chile - All Inclusive',
                quantidadePremios: 3,
                dataInicio: '2023-06-01T00:00:00Z',
                dataFim: '2023-08-31T23:59:59Z',
                ativa: true,
                empreendimentoId: 'all'
            };
        }
        return found;
    }, [selectedCampanhaId]);

    const isConcluida = new Date(campanha.dataFim) < new Date();
    const isSorteio = campanha.regra?.tipo === 'sorteio_cotas';

    // Mock participation data
    const participacao = {
        corretoresAtivos: 42,
        totalCorretores: 156,
        imobiliariasAtivas: 12,
        totalAtingimentos: 15,
        cuponsGerados: 1240,
        visitantesPagina: 350
    };

    const leaderboard = [
        { nome: 'João Mendes', imob: 'Imobiliária Prime', desempenho: 45, max: 10 },
        { nome: 'Ana Oliveira', imob: 'Rede Lares', desempenho: 38, max: 10 },
        { nome: 'Pedro Santos', imob: 'Rede Lares', desempenho: 35, max: 10 },
        { nome: 'Maria Souza', imob: 'Imobiliária Prime', desempenho: 22, max: 10 },
        { nome: 'Beatriz Almeida', imob: 'Casa & Cia', desempenho: 18, max: 10 },
    ];

    // Mock chart data (Last 7 weeks or days evolution depending on campaign size)
    const evolutionChart = [
        { rotulo: 'Semana 1', valor: 12, max: 100 },
        { rotulo: 'Semana 2', valor: 25, max: 100 },
        { rotulo: 'Semana 3', valor: 40, max: 100 },
        { rotulo: 'Semana 4', valor: 38, max: 100 },
        { rotulo: 'Semana 5', valor: 65, max: 100 },
        { rotulo: 'Semana 6', valor: 85, max: 100 },
        { rotulo: 'Semana 7', valor: 95, max: 100 },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Nav */}
            <button 
                onClick={() => setCurrentPage('campanhas')}
                className="flex items-center gap-2 text-text-secondary hover:text-brand transition-colors text-sm font-medium"
            >
                <ChevronLeft size={16} /> Voltar para Campanhas
            </button>

            {/* Header Hero */}
            <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lvl-gold/5 rounded-full blur-[80px]" />
                
                <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-auto rounded-xl bg-slate-900 border border-border overflow-hidden relative flex items-center justify-center shrink-0">
                    {campanha.premioImagemUrl ? (
                        <img src={campanha.premioImagemUrl} alt={campanha.premio} className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <Gift size={64} className="text-white/20" />
                    )}
                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full backdrop-blur-md border ${
                            isConcluida ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-brand/20 text-green-400 border-brand/50'
                        }`}>
                            {isConcluida ? 'Concluída' : 'Em Andamento'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary tracking-tight">{campanha.titulo}</h1>
                        <p className="text-text-secondary mt-2 max-w-2xl leading-relaxed">
                            {campanha.descricao}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 py-4">
                        <div className="flex items-center gap-2 text-sm bg-bg border border-border px-3 py-1.5 rounded-lg text-text-primary">
                            <Trophy size={16} className="text-lvl-gold" />
                            <strong>Prêmio:</strong> {campanha.premio}
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-bg border border-border px-3 py-1.5 rounded-lg text-text-primary">
                            <CalendarDays size={16} className="text-lvl-gold" />
                            <strong>Período:</strong> {new Date(campanha.dataInicio).toLocaleDateString()} a {new Date(campanha.dataFim).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-bg border border-border px-3 py-1.5 rounded-lg text-text-primary">
                            <Settings size={16} className="text-lvl-gold" />
                            <strong className="capitalize">{campanha.regra?.tipo.replace('_', ' ')}</strong> ({campanha.regra?.metrica})
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-1 flex items-center justify-between">
                        Engajamento da Rede
                        <Users size={16} className="text-lvl-gold" />
                    </div>
                    <div className="text-3xl font-bold text-text-primary mt-2 flex items-baseline gap-2">
                        {Math.round((participacao.corretoresAtivos / participacao.totalCorretores) * 100)}%
                        <span className="text-sm font-medium text-text-muted font-normal">aderiram</span>
                    </div>
                    <div className="text-xs text-text-muted mt-2">
                        {participacao.corretoresAtivos} de {participacao.totalCorretores} profissionais
                    </div>
                </div>

                <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-1 flex items-center justify-between">
                        Acesso ao Painel
                        <TrendingUp size={16} className="text-lvl-gold" />
                    </div>
                    <div className="text-3xl font-bold text-text-primary mt-2 flex items-baseline gap-2">
                        {participacao.visitantesPagina}
                    </div>
                    <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Alta visibilidade na dashboard
                    </div>
                </div>

                {isSorteio ? (
                    <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm md:col-span-2 bg-gradient-to-r from-bg-surface to-lvl-gold/5">
                        <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-1 flex items-center justify-between">
                            Vidas/Bilhetes Gerados
                            <Ticket size={16} className="text-lvl-gold" />
                        </div>
                        <div className="text-3xl font-bold text-text-primary mt-2">
                            {participacao.cuponsGerados} <span className="text-lg font-medium text-text-muted font-normal">bilhetes</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-2">
                            Com média de {Math.round(participacao.cuponsGerados / participacao.corretoresAtivos)} bilhetes por corretor ativo.
                        </div>
                    </div>
                ) : (
                    <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm md:col-span-2 bg-gradient-to-r from-bg-surface to-lvl-gold/5">
                        <div className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-1 flex items-center justify-between">
                            Atingimento da Meta
                            <CheckCircle2 size={16} className="text-lvl-gold" />
                        </div>
                        <div className="text-3xl font-bold text-text-primary mt-2">
                            {participacao.totalAtingimentos} <span className="text-lg font-medium text-text-muted font-normal">vencedores</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-2">
                            Garantiram a premiação ao superar {campanha.regra?.alvo} {campanha.regra?.metrica}.
                        </div>
                    </div>
                )}
            </div>

            {/* Split: Evolução + Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Chart */}
                <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border">
                        <h2 className="font-semibold text-lg text-text-primary flex items-center gap-2">
                            <BarChart3 size={18} className="text-lvl-gold" />
                            Evolução da Campanha
                        </h2>
                        <p className="text-sm text-text-secondary mt-0.5">Métrica de {campanha.regra?.metrica} validada por período</p>
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col justify-end min-h-[300px]">
                        <div className="flex items-end justify-between h-56 gap-2 border-b border-border/50 pb-2 relative">
                            {/* Grid lines (decorative) */}
                            <div className="absolute top-0 w-full border-t border-dashed border-border/50" />
                            <div className="absolute top-1/2 w-full border-t border-dashed border-border/50" />
                            
                            {evolutionChart.map((col, i) => {
                                const percentage = (col.valor / col.max) * 100;
                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                                        <div className="w-full h-full flex justify-center items-end relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-bg px-2 py-1 rounded text-xs font-bold text-text-primary shadow-lg border border-border transition-opacity z-10">
                                                {col.valor}
                                            </div>
                                            {/* Bar */}
                                            <div 
                                                className="w-full max-w-[40px] bg-gradient-to-t from-lvl-gold/40 to-lvl-gold rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110" 
                                                style={{ height: `${percentage}%`, minHeight: '4%' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* X Axis Labels */}
                        <div className="flex justify-between mt-3 text-xs text-text-muted font-medium">
                            {evolutionChart.map((col, i) => (
                                <div key={i} className="flex-1 text-center truncate px-1">
                                    {col.rotulo}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ranking / Participantes */}
                <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border">
                        <h2 className="font-semibold text-lg text-text-primary">Top Performance (Ranking Final)</h2>
                        <p className="text-sm text-text-secondary mt-0.5">Os líderes baseados na métrica de {campanha.regra?.metrica}.</p>
                    </div>
                    <div className="divide-y divide-border overflow-y-auto max-h-[350px] custom-scrollbar">
                        {leaderboard.map((broker, idx) => (
                            <div key={idx} className="p-4 flex items-center hover:bg-black/5 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4 ${
                                    idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                                    idx === 2 ? 'bg-orange-300 text-orange-900' :
                                    'bg-bg-elevated text-text-muted'
                                }`}>
                                    {idx + 1}º
                                </div>
                                
                                <div className="flex-1">
                                    <div className="font-semibold text-text-primary">{broker.nome}</div>
                                    <div className="text-xs text-text-muted">{broker.imob}</div>
                                </div>

                                <div className="w-1/3 flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-bg border border-border rounded-full overflow-hidden hidden sm:block">
                                        <div 
                                            className="h-full bg-lvl-gold rounded-full" 
                                            style={{ width: `${Math.min(100, (broker.desempenho / 50) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-sm font-bold text-text-primary whitespace-nowrap min-w-[60px] text-right">
                                        {broker.desempenho} <span className="text-xs text-text-muted font-medium">{campanha.regra?.metrica}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
        </div>
    );
}

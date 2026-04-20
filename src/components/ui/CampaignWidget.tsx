import { useState, useEffect } from 'react';
import { Trophy, Clock, Star, ChevronUp, ChevronDown, Building2 } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import type { Campanha } from '../../data/mockData';

interface CampaignWidgetProps {
    campanha: Campanha;
    currentPontos: number;
    enterpriseName?: string;
    developerName?: string;
}

export function CampaignWidget({ campanha, currentPontos, enterpriseName, developerName }: CampaignWidgetProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMinimized(true);
        }, 5000); // Auto minimize after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!campanha.ativa) return null;

    const progress = Math.min((currentPontos / campanha.metaPontos) * 100, 100);
    const missingPontos = Math.max(campanha.metaPontos - currentPontos, 0);

    // Calculate days remaining
    const daysRemaining = Math.ceil((new Date(campanha.dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (isMinimized) {
        return (
            <Card className="relative overflow-hidden border-none shadow-lg group bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex items-center justify-between transition-all duration-300">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Trophy size={18} className="text-yellow-300" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Campanha Ativa</p>
                        <h3 className="text-sm font-bold truncate max-w-[200px]">{campanha.titulo}</h3>
                    </div>
                    <div className="hidden sm:block flex-1 max-w-xs mx-4">
                        <div className="flex justify-between text-[10px] font-medium mb-1">
                            <span>{currentPontos} pts</span>
                            <span className="text-indigo-200">{campanha.metaPontos} pts</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 h-8 w-8 ml-2 p-0 rounded-full"
                    onClick={() => setIsMinimized(false)}
                >
                    <ChevronDown size={18} />
                </Button>
            </Card>
        )
    }

    return (
        <Card className="relative overflow-hidden border-none shadow-lg group transition-all duration-300">
            {/* Background with gradient and subtle pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
            </div>

            <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6 text-white">
                <div className="absolute top-4 right-4">
                    <Button
                        variant="ghost"
                        className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0 rounded-full"
                        onClick={() => setIsMinimized(true)}
                    >
                        <ChevronUp size={18} />
                    </Button>
                </div>

                {/* Reward Image/Icon */}
                <div className="shrink-0 relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                        {campanha.premioImagemUrl ? (
                            <img src={campanha.premioImagemUrl} alt={campanha.premio} className="w-full h-full object-cover" />
                        ) : (
                            <Trophy size={40} className="text-yellow-300" />
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        PRÊMIO
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left space-y-3 w-full">
                    <div>
                        <div className="flex items-center justify-center sm:justify-between mb-1 pr-8">
                            <div className="flex flex-col sm:items-start text-xs">
                                <span className="text-indigo-200 uppercase tracking-wider flex items-center gap-1 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Campanha Ativa
                                </span>
                                {(enterpriseName || developerName) && (
                                    <span className="text-white/70 mt-0.5 flex items-center gap-1">
                                        <Building2 size={10} />
                                        {enterpriseName} {developerName ? `• ${developerName}` : ''}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium text-white/80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full mt-2 sm:mt-0">
                                <Clock size={12} />
                                {daysRemaining} dias restantes
                            </span>
                        </div>
                        <h3 className="text-xl font-bold">{campanha.titulo}</h3>
                        <p className="text-indigo-100 text-sm mt-1">{campanha.descricao}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                            <span>{currentPontos} Pontos</span>
                            <span className="text-indigo-200">Meta: {campanha.metaPontos} Pontos</span>
                        </div>
                        <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(255,200,0,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-indigo-200 text-right">
                            {missingPontos > 0
                                ? `Faltam apenas ${missingPontos} pontos para ganhar!`
                                : '🎉 Parabéns! Você atingiu a meta!'}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

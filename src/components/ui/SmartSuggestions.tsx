import { AlertTriangle, Flame, CheckSquare, ArrowRight, Zap } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import type { Suggestion } from '../../data/mockData';

interface SmartSuggestionsProps {
    suggestions: Suggestion[];
}

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
    if (suggestions.length === 0) return null;

    const getIcon = (type: Suggestion['type']) => {
        switch (type) {
            case 'opportunity': return <Flame className="text-orange-500" size={20} />;
            case 'alert': return <AlertTriangle className="text-red-500" size={20} />;
            case 'task': return <CheckSquare className="text-blue-500" size={20} />;
            default: return <Zap className="text-yellow-500" size={20} />;
        }
    };

    const getBgColor = (type: Suggestion['type']) => {
        switch (type) {
            case 'opportunity': return 'bg-orange-50 border-orange-100';
            case 'alert': return 'bg-red-50 border-red-100';
            case 'task': return 'bg-blue-50 border-blue-100';
            default: return 'bg-gray-50';
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Sugestões do Assistente</h3>
                        <p className="text-xs text-text-muted">Ações recomendadas para você hoje</p>
                    </div>
                </div>
                <span className="text-xs font-medium text-brand bg-brand/5 px-2 py-1 rounded-full">
                    {suggestions.length} sugestões
                </span>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className={`p-4 rounded-xl border ${getBgColor(suggestion.type)} transition-all hover:shadow-md flex flex-col sm:flex-row items-start gap-3`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {getIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${suggestion.type === 'opportunity' ? 'text-orange-600' :
                                    suggestion.type === 'alert' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {suggestion.type === 'opportunity' ? 'Oportunidade' :
                                        suggestion.type === 'alert' ? 'Atenção' : 'Tarefa'}
                                </span>
                                {suggestion.points && (
                                    <span className="text-[10px] font-bold text-brand bg-white px-1.5 py-0.5 rounded shadow-sm">
                                        +{suggestion.points} pts
                                    </span>
                                )}
                            </div>
                            <h4 className="font-semibold text-text-primary text-sm mb-0.5">{suggestion.title}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{suggestion.description}</p>
                            {/* Button on its own row on mobile */}
                            <div className="mt-3 sm:hidden">
                                <Button className="w-full h-9 text-xs" variant={suggestion.priority === 'high' ? 'primary' : 'secondary'}>
                                    {suggestion.actionLabel}
                                    <ArrowRight size={14} className="ml-1.5" />
                                </Button>
                            </div>
                        </div>
                        {/* Button inline on sm+ */}
                        <Button className="hidden sm:flex shrink-0 self-center h-8 px-3 text-xs" variant={suggestion.priority === 'high' ? 'primary' : 'secondary'}>
                            {suggestion.actionLabel}
                            <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}

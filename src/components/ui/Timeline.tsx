import { type HistoricoEntry } from '../../data/mockData';
import {
    UserPlus,
    ArrowRightLeft,
    RefreshCw,
    XCircle,
    Zap,
    CircleDot,
    MessageCircle,
} from 'lucide-react';

const iconMap: Record<HistoricoEntry['tipo'], React.ReactNode> = {
    lead_criado: <Zap size={14} />,
    lead_distribuido: <UserPlus size={14} />,
    status_alterado: <CircleDot size={14} />,
    lead_reatribuido: <ArrowRightLeft size={14} />,
    lead_transferido: <ArrowRightLeft size={14} />,
    lead_reativado: <RefreshCw size={14} />,
    lead_perdido: <XCircle size={14} />,
    interacao: <MessageCircle size={14} />,
};

const colorMap: Record<HistoricoEntry['tipo'], string> = {
    lead_criado: 'bg-blue-50 text-blue-600',
    lead_distribuido: 'bg-green-50 text-green-600',
    status_alterado: 'bg-sky-50 text-sky-600',
    lead_reatribuido: 'bg-violet-50 text-violet-600',
    lead_transferido: 'bg-amber-50 text-amber-600',
    lead_reativado: 'bg-emerald-50 text-emerald-600',
    lead_perdido: 'bg-red-50 text-red-500',
    interacao: 'bg-slate-50 text-slate-500',
};

interface TimelineProps {
    items: HistoricoEntry[];
}

export function Timeline({ items }: TimelineProps) {
    const sorted = [...items].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
                {sorted.map((item) => {
                    const dateStr = new Date(item.data).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    });

                    return (
                        <div key={item.id} className="flex gap-3 relative">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${colorMap[item.tipo]}`}>
                                {iconMap[item.tipo]}
                            </div>
                            <div className="min-w-0 pb-1">
                                <p className="text-sm font-medium text-text-primary">
                                    {item.descricao}
                                    {item.de && item.para && (
                                        <span className="text-text-muted font-normal">
                                            {' '}— de <span className="font-medium">{item.de}</span> para <span className="font-medium">{item.para}</span>
                                        </span>
                                    )}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-text-muted">{dateStr}</span>
                                    {item.autor && <span className="text-xs text-text-muted">• {item.autor}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

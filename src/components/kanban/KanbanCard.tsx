import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '../../data/mockData';
import { getEmpreendimento } from '../../data/mockData';
import { Phone, Clock } from 'lucide-react';

interface Props {
    lead: Lead;
    onCardClick?: (leadId: string) => void;
}

export function KanbanCard({ lead, onCardClick }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: 'lead',
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const empreendimento = getEmpreendimento(lead.empreendimentoId);

    // Format relative time like "2h atrás"
    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-brand/5 border-2 border-brand/20 p-4 rounded-xl opacity-60 h-24"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative"
            onClick={() => onCardClick?.(lead.id)}
        >
            <div
                className="flex justify-between items-start mb-2"
                {...attributes}
                {...listeners}
                onClick={e => e.stopPropagation()}
                title="Arraste para mover"
            >
                <span className="font-bold text-slate-800 text-sm truncate cursor-grab active:cursor-grabbing">{lead.nome}</span>
                <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={10} />
                    {getTimeAgo(lead.criadoEm)}
                </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 truncate">{empreendimento?.nome}</p>

            <div className="flex items-center gap-2">
                <button
                    className="w-7 h-7 rounded-full bg-brand/5 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${lead.telefone}`);
                    }}
                >
                    <Phone size={12} />
                </button>
                {/* Add more quick actions if needed */}
            </div>
        </div>
    );
}

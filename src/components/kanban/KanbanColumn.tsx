import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, LeadStatus } from '../../data/mockData';
import { statusLabels, statusColors } from '../../data/mockData';
import { KanbanCard } from './KanbanCard';

interface Props {
    status: LeadStatus;
    leads: Lead[];
    onCardClick?: (leadId: string) => void;
}

export function KanbanColumn({ status, leads, onCardClick }: Props) {
    const { setNodeRef } = useDroppable({
        id: status,
        data: {
            type: 'column',
            status,
        },
    });

    const colorClass = statusColors[status] || 'bg-gray-50 text-gray-700';

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 h-full shrink-0">
            <div className={`p-3 rounded-t-xl border-b-2 border-white/50 flex items-center justify-between ${colorClass}`}>
                <h3 className="font-bold text-sm tracking-tight">{statusLabels[status]}</h3>
                <span className="bg-white/40 px-2 py-0.5 rounded-full text-xs font-bold">{leads.length}</span>
            </div>

            <div className="flex-1 bg-slate-50/50 p-2 space-y-2 overflow-y-auto min-h-[150px] rounded-b-xl border border-slate-100">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map(lead => (
                        <KanbanCard key={lead.id} lead={lead} onCardClick={onCardClick} />
                    ))}
                </SortableContext>

                {leads.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic opacity-50">
                        Vazio
                    </div>
                )}
            </div>
        </div>
    );
}

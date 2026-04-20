import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Lead, LeadStatus } from '../../data/mockData';
import { leads as initialLeads } from '../../data/mockData';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: LeadStatus[] = ['novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda'];

interface KanbanBoardProps {
    leads?: Lead[];
    onCardClick?: (leadId: string) => void;
}

export function KanbanBoard({ leads: externalLeads, onCardClick }: KanbanBoardProps = {}) {
    const [leads] = useState<Lead[]>(externalLeads ?? initialLeads);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (_event: DragStartEvent) => { return; };
    const handleDragOver = (_event: DragOverEvent) => { return; };
    const handleDragEnd = (_event: DragEndEvent) => { return; };

    return (
        <div className="flex h-full overflow-x-auto gap-4 p-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {COLUMNS.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        leads={leads.filter(l => l.status === status)}
                        onCardClick={onCardClick}
                    />
                ))}
            </DndContext>
        </div>
    );
}

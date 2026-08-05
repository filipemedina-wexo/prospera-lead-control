import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
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


    return (
        <div className="flex h-full overflow-x-auto gap-4 p-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
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

import { type LeadStatus, statusLabels, statusColors } from '../../data/mockData';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
    status: LeadStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium',
                statusColors[status],
                className
            )}
        >
            {statusLabels[status]}
        </span>
    );
}

import { type LeadStatus, statusLabels } from '../../data/mockData';

interface FunnelChartProps {
    data: { status: LeadStatus; count: number }[];
}

const funnelColors: Record<LeadStatus, string> = {
    novo: '#3B82F6',
    em_atendimento: '#14B8A6',
    contatado: '#0EA5E9',
    visita_marcada: '#8B5CF6',
    proposta: '#F59E0B',
    venda: '#22C55E',
    perdido: '#EF4444',
};

export function FunnelChart({ data }: FunnelChartProps) {
    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-3">
            {data.map(({ status, count }) => {
                const pct = (count / max) * 100;
                return (
                    <div key={status} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">
                                {statusLabels[status]}
                            </span>
                            <span className="text-sm font-semibold">{count}</span>
                        </div>
                        <div className="h-2.5 bg-black/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: funnelColors[status] }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

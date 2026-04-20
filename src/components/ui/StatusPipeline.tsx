import { Check } from 'lucide-react';
import { statusLabels, type LeadStatus } from '../../data/mockData';

interface StatusPipelineProps {
    currentStatus: LeadStatus;
    statusList: LeadStatus[];
    onStatusClick: (status: LeadStatus) => void;
}

export function StatusPipeline({ currentStatus, statusList, onStatusClick }: StatusPipelineProps) {
    const currentIndex = statusList.indexOf(currentStatus);

    return (
        <div className="flex items-center w-full overflow-x-auto py-2 px-1 scrollbar-hide">
            {statusList.map((status, index) => {
                const isPast = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isNext = index === currentIndex + 1;

                // Chevron Shape Logic
                let clipPath = 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%)'; // Middle default
                if (index === 0) clipPath = 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)'; // Start
                if (index === statusList.length - 1) clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 8% 50%)'; // End

                // Margins to overlap arrows
                const marginLeft = index === 0 ? '' : '-ml-3';
                const paddingLeft = index === 0 ? 'pl-4' : 'pl-7';

                return (
                    <button
                        key={status}
                        onClick={() => onStatusClick(status)}
                        title={isCurrent ? 'Etapa Atual' : isPast ? 'Etapa Concluída' : `Clique para avançar para ${statusLabels[status]}`}
                        className={`
                            relative h-11 flex-1 min-w-[110px] flex items-center pr-4 transition-all duration-300 focus:outline-none shrink-0 group
                            ${paddingLeft} ${marginLeft}
                            ${isCurrent
                                ? 'bg-brand text-white z-30 shadow-md font-bold'
                                : isPast
                                    ? 'bg-emerald-50 text-emerald-600 z-20 hover:bg-emerald-100 font-medium'
                                    : isNext
                                        ? 'bg-white border-2 border-brand/10 text-brand z-15 hover:bg-brand/5 font-semibold shadow-sm ring-1 ring-brand/5'
                                        : 'bg-gray-50 text-gray-400 z-10 hover:bg-gray-100'
                            }
                        `}
                        style={{ clipPath }}
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            {isPast && <Check size={13} strokeWidth={3} className="shrink-0" />}
                            <span className="text-[11px] uppercase tracking-wider truncate">{statusLabels[status]}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

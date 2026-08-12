import { Check } from 'lucide-react';
import { statusLabels, type LeadStatus } from '../../data/mockData';

interface StatusPipelineProps {
    currentStatus: LeadStatus;
    statusList: LeadStatus[];
    onStatusClick: (status: LeadStatus) => void;
}

export function StatusPipeline({ currentStatus, statusList, onStatusClick }: StatusPipelineProps) {
    const currentIndex = statusList.indexOf(currentStatus);
    const compactLabels: Record<string, string> = {
        novo: 'Novo',
        em_atendimento: 'Atendimento',
        contatado: 'Contatado',
        visita_marcada: 'Visita',
        proposta: 'Proposta',
        venda: 'Venda',
    };

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
                        disabled={!isPast && !isCurrent && !isNext}
                        title={isCurrent ? 'Etapa Atual' : isPast ? 'Etapa Concluída' : `Clique para avançar para ${statusLabels[status]}`}
                        className={`
                            relative h-12 flex-1 min-w-[92px] flex items-center pr-3 transition-all duration-300 focus:outline-none shrink-0 group disabled:cursor-not-allowed
                            ${paddingLeft} ${marginLeft}
                            ${isCurrent
                                ? 'bg-brand text-white z-30 shadow-md font-bold'
                                : isPast
                                    ? 'bg-emerald-50 text-emerald-600 z-20 hover:bg-emerald-100 font-medium'
                                    : isNext
                                        ? 'bg-violet-100 text-brand z-20 hover:bg-violet-200 font-bold shadow-sm'
                                        : 'bg-gray-100/80 text-gray-400 z-10 opacity-60'
                            }
                        `}
                        style={{ clipPath }}
                    >
                        <div className="flex items-center justify-center gap-1.5 w-full whitespace-nowrap">
                            {isPast && <Check size={13} strokeWidth={3} className="shrink-0" />}
                            <span className="text-[11px] font-semibold tracking-tight">{compactLabels[status] || statusLabels[status]}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

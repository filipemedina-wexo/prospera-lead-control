import {
    Users,
    UserPlus,
    CheckCircle2,
    Clock,
    Calendar
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CampaignWidget } from '../components/ui/CampaignWidget';
import { SmartSuggestions } from '../components/ui/SmartSuggestions';
import { PriorityLeadList } from '../components/ui/PriorityLeadList';
import {
    statsCards,
    smartSuggestions,
    campanhaAtiva,
    corretores,
    incorporadora,
    getCorretor,
    getEmpreendimento,
} from '../data/mockData';


const statsIcons: Record<string, React.ReactNode> = {
    Clock: <Clock size={20} />,
    CheckCircle2: <CheckCircle2 size={20} />,
    Calendar: <Calendar size={20} />,
    Users: <Users size={20} />,
};

const getColorClass = (color: string) => {
    switch (color) {
        case 'blue': return 'text-blue-600 bg-blue-100';
        case 'green': return 'text-green-600 bg-green-100';
        case 'violet': return 'text-violet-600 bg-violet-100';
        case 'amber': return 'text-amber-600 bg-amber-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

export function Dashboard() {
    const currentCorretor = getCorretor('cor-1') || corretores[0]; // Assuming user is cor-1
    const enterprise = getEmpreendimento(campanhaAtiva.empreendimentoId);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard do Corretor</h1>
                    <p className="text-text-secondary text-sm mt-1">Sua central de operações e metas.</p>
                </div>
                <Button className="self-start sm:self-auto">
                    <UserPlus size={16} className="mr-2" />
                    Novo Lead
                </Button>
            </div>

            {/* Gamification Campaign Widget */}
            <CampaignWidget
                campanha={campanhaAtiva}
                currentPontos={currentCorretor.pontos}
                enterpriseName={enterprise?.nome}
                developerName={incorporadora.nome}
            />

            {/* Stats Grid - Effort Focused */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat) => (
                    <Card key={stat.id} variant="hover" className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getColorClass(stat.color)}`}>
                                    {statsIcons[stat.icon]}
                                </div>
                                <span className="text-sm text-text-secondary font-medium">
                                    {stat.label}
                                </span>
                            </div>
                            {stat.change && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' :
                                    stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold mt-3 tracking-tight">
                            {stat.value}
                        </p>
                        <p className="text-xs text-text-muted mt-1">{stat.description}</p>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid: Suggestions (Left) + Pipeline/Perf (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Priority Leads */}
                <div className="lg:col-span-2 h-full col-span-1">
                    <PriorityLeadList />
                </div>

                {/* Right Column: Suggestions */}
                <div className="lg:col-span-1 space-y-6">
                    <SmartSuggestions suggestions={smartSuggestions} />
                </div>
            </div>

        </div >
    );
}

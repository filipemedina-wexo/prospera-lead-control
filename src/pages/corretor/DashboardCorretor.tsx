import { useState } from 'react';
import { Target, Zap, Calendar, TrendingUp, Clock, Star, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SmartSuggestions } from '../../components/ui/SmartSuggestions';
import { CampaignWidget } from '../../components/ui/CampaignWidget';
import { PriorityLeadList } from '../../components/ui/PriorityLeadList';
import {
    leads,
    corretores,
    getSlaMinutes,
    isSlaEstourado,
    smartSuggestions,
    performanceMetas,
} from '../../data/mockData';

const CORRETOR_ID = 'cor-1';

// Campanha mockada local para o dashboard
const campanhaMock = {
    id: 'camp-1',
    titulo: 'Sprint de Vendas — Fevereiro',
    descricao: 'Alcance 400 pts este mês e ganhe um bônus de R$500 + troféu digital',
    metaPontos: 400,
    premio: 'Bônus R$500',
    dataInicio: new Date(Date.now() - 86400000 * 10).toISOString(),
    dataFim: new Date(Date.now() + 86400000 * 7).toISOString(),
    ativa: true,
    empreendimentoId: 'emp-1',
};

export function DashboardCorretor() {
    const corretor = corretores.find(c => c.id === CORRETOR_ID);
    const meusLeads = leads.filter(l => l.corretorId === CORRETOR_ID);
    const [today] = useState(new Date());

    // KPIs pessoais
    const leadsAtivos = meusLeads.filter(l => !['venda', 'perdido'].includes(l.status)).length;
    const slaValues = meusLeads.map(getSlaMinutes).filter((v): v is number => v !== null);
    const slaMediaMin = slaValues.length > 0 ? Math.round(slaValues.reduce((a, b) => a + b, 0) / slaValues.length) : 0;
    const visitasMarcadas = meusLeads.filter(l => l.status === 'visita_marcada').length;
    const vendas = meusLeads.filter(l => l.status === 'venda').length;
    const totalDistribuidos = meusLeads.length;
    const taxaConversao = totalDistribuidos > 0 ? Math.round((vendas / totalDistribuidos) * 100) : 0;
    const slaEstourados = meusLeads.filter(isSlaEstourado).length;

    // Visitas agendadas hoje
    const visitasHoje = meusLeads.filter(l => {
        if (!l.dataVisita) return false;
        const v = new Date(l.dataVisita);
        return v.toDateString() === today.toDateString();
    });

    const pontos = corretor?.pontos ?? 0;

    // XP level system
    const nivel = pontos >= 500 ? 'Diamante' : pontos >= 300 ? 'Ouro' : pontos >= 150 ? 'Prata' : 'Bronze';
    const nivelColor = pontos >= 500 ? 'text-sky-400' : pontos >= 300 ? 'text-yellow-500' : pontos >= 150 ? 'text-slate-400' : 'text-amber-700';
    const proximoNivel = pontos >= 500 ? 500 : pontos >= 300 ? 500 : pontos >= 150 ? 300 : 150;
    const progressoNivel = Math.min(Math.round((pontos / proximoNivel) * 100), 100);

    return (
        <div className="space-y-6">
            {/* Hero de boas-vindas */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-accent via-brand to-emerald-400 p-6 text-white shadow-lg shadow-brand/20">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-white/70 text-sm font-medium">Bem-vindo de volta 👋</p>
                        <h1 className="text-2xl font-bold mt-0.5">{corretor?.nome ?? 'Corretor'}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Star size={14} className={nivelColor} fill="currentColor" />
                            <span className={`text-sm font-semibold ${nivelColor}`}>Nível {nivel}</span>
                            <span className="text-white/50">·</span>
                            <span className="text-sm text-white/80">{pontos} pts</span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="text-xs text-white/60 mb-1">Progresso para próximo nível</div>
                        <div className="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-700"
                                style={{ width: `${progressoNivel}%` }}
                            />
                        </div>
                        <div className="text-xs text-white/60 mt-1">{pontos}/{proximoNivel} pts</div>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Leads Ativos</p>
                        <Zap size={16} className="text-brand" />
                    </div>
                    <p className="text-3xl font-light">{leadsAtivos}</p>
                    <p className="text-xs text-text-muted mt-1">em atendimento</p>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">SLA Médio</p>
                        <Clock size={16} className={slaMediaMin > 10 ? 'text-red-500' : 'text-green-500'} />
                    </div>
                    <p className={`text-3xl font-light ${slaMediaMin > 10 ? 'text-red-500' : ''}`}>{slaMediaMin}m</p>
                    <p className={`text-xs mt-1 ${slaEstourados > 0 ? 'text-red-400' : 'text-text-muted'}`}>
                        {slaEstourados > 0 ? `${slaEstourados} SLA estourado${slaEstourados > 1 ? 's' : ''}` : 'Dentro do limite'}
                    </p>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Visitas Marcadas</p>
                        <Calendar size={16} className="text-violet-500" />
                    </div>
                    <p className="text-3xl font-light">{visitasMarcadas}</p>
                    <p className="text-xs text-text-muted mt-1">{visitasHoje.length > 0 ? `${visitasHoje.length} hoje` : 'nenhuma hoje'}</p>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Taxa de Conversão</p>
                        <TrendingUp size={16} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-light">{taxaConversao}%</p>
                    <p className="text-xs text-text-muted mt-1">{vendas} venda{vendas !== 1 ? 's' : ''} no período</p>
                </Card>
            </div>

            {/* Corpo 2 colunas em desktop */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">

                {/* Coluna principal (2/3): ações e leads */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Leads Prioritários */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={18} className="text-red-500" />
                            <h3 className="font-semibold text-base">Leads que Precisam de Atenção</h3>
                        </div>
                        <PriorityLeadList />
                    </div>

                    {/* Meta Semanal */}
                    <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={18} className="text-brand" />
                            <h3 className="font-semibold text-base">Meta Semanal</h3>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-text-muted">Progresso</span>
                            <span className="font-bold text-brand">{performanceMetas.weeklyGoal}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-brand to-brand/70 rounded-full transition-all duration-700"
                                style={{ width: `${performanceMetas.weeklyGoal}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-text-muted">
                            <span>{performanceMetas.tasksCompleted} tarefas completas</span>
                            <span>{performanceMetas.tasksPending} pendentes</span>
                        </div>
                    </Card>
                </div>

                {/* Coluna lateral (1/3): campanha, visitas e sugestões */}
                <div className="space-y-6">
                    {/* Campanha Ativa */}
                    <CampaignWidget
                        campanha={campanhaMock}
                        currentPontos={pontos}
                        enterpriseName="Residencial Aurora"
                        developerName="Construtora Horizonte"
                    />

                    {/* Visitas de Hoje */}
                    {visitasHoje.length > 0 && (
                        <Card className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar size={18} className="text-violet-500" />
                                <h3 className="font-semibold text-base">Visitas de Hoje</h3>
                                <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-full">{visitasHoje.length}</span>
                            </div>
                            <div className="space-y-3">
                                {visitasHoje.map(lead => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                                                {lead.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{lead.nome}</p>
                                                <p className="text-xs text-text-muted">
                                                    {lead.dataVisita ? new Date(lead.dataVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Sugestões inteligentes */}
                    <SmartSuggestions suggestions={smartSuggestions} />
                </div>
            </div>
        </div>
    );
}

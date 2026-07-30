import { Activity, Users, Store, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export function DashboardAdmin() {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Painel SaaS</h1>
                <p className="text-text-secondary mt-1">Visão global da infraestrutura Prospera e adoção dos clientes.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                            <Activity className="text-brand" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Total de Leads (Mês)</p>
                            <p className="text-2xl font-bold">14,285</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Building2 className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Incorporadoras</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">12</p>
                                <span className="text-xs font-semibold text-emerald-500">+2</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Store className="text-indigo-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Imobiliárias</p>
                            <p className="text-2xl font-bold">84</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                            <Users className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Corretores Ativos</p>
                            <p className="text-2xl font-bold">1,240</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simulated Chart Area */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Crescimento de Infraestrutura</h2>
                        <span className="text-sm text-text-muted">Últimos 6 meses</span>
                    </div>
                    <div className="h-[300px] flex items-end gap-2 text-transparent">
                        {[40, 50, 70, 80, 110, 150].map((h, i) => (
                            <div key={i} className="flex-1 bg-brand/20 hover:bg-brand/40 transition-colors rounded-t-lg relative" style={{ height: `${(h / 150) * 100}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-text-secondary">{h}k</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Financial Summary */}
                <Card className="p-6 bg-gradient-to-br from-black/5 to-transparent">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-brand" /> Health Score SaaS
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="bg-bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm font-medium">ARR (Receita Recorrente Anual Estimada)</p>
                                <p className="text-2xl font-bold text-brand">R$ 1.84M</p>
                            </div>
                            <TrendingUp size={32} className="text-emerald-500/20" />
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-semibold">Banda Larga / Servidor (Consumo Mensal)</span>
                                <span className="text-amber-500 font-bold">78%</span>
                            </div>
                            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[78%] rounded-full" />
                            </div>
                            <p className="text-xs text-text-muted mt-2">A arquitetura atual suporta até ~20.000 leads processados/dia.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

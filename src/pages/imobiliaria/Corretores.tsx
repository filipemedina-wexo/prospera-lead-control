import { useState } from 'react';
import {
    Plus, X, Phone, Mail, Building2, CheckCircle2, Circle,
    Clock, Target, AlertCircle, Trophy, PhoneCall, MessageSquare, CalendarCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    corretores, leads, empreendimentos, metasCorretores,
    getSlaMinutes, type Corretor
} from '../../data/mockData';
import { cn } from '../../lib/utils';

const IMOB_ID = 'imob-1';

// --- Cálculo de stats de um corretor ---
function calcStats(c: Corretor) {
    const cLeads = leads.filter(l => l.corretorId === c.id);
    const vendas = cLeads.filter(l => l.status === 'venda').length;
    const visitas = cLeads.filter(l => ['visita_marcada', 'proposta', 'venda'].includes(l.status)).length;
    const contatos = cLeads.filter(l => l.firstResponseAt).length;
    const followUps = cLeads.filter(l =>
        l.historico.some(h => h.tipo === 'interacao' || h.tipo === 'status_alterado')
    ).length;
    const novos = cLeads.filter(l => l.status === 'novo' && !l.firstResponseAt).length;
    const withResp = cLeads.filter(l => l.firstResponseAt);
    const slaAvg = withResp.length > 0
        ? Math.round(withResp.reduce((s, l) => s + (getSlaMinutes(l) || 0), 0) / withResp.length)
        : 0;
    const conversao = cLeads.length > 0 ? Math.round((vendas / cLeads.length) * 100) : 0;
    const meta = metasCorretores.find(m => m.corretorId === c.id);
    return { cLeads, vendas, visitas, contatos, followUps, novos, slaAvg, conversao, meta };
}

// --- Drawer de detalhe do corretor ---
interface DrawerProps {
    corretor: Corretor;
    onClose: () => void;
}

function CorretorDrawer({ corretor, onClose }: DrawerProps) {
    const stats = calcStats(corretor);
    const empsDaImob = empreendimentos.slice(0, 4); // empreendimentos que a imobiliária tem acesso
    const corretorEmps = corretor.empreendimentoIds ?? [];
    const [empsAtivos, setEmpsAtivos] = useState<string[]>(corretorEmps);

    const toggleEmp = (id: string) => {
        setEmpsAtivos(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 z-40 lg:bg-black/20"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-bg border-l border-border z-50 flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-border flex items-start justify-between bg-bg shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand text-lg font-bold overflow-hidden shrink-0">
                            {corretor.avatarUrl
                                ? <img src={corretor.avatarUrl} className="w-full h-full object-cover" alt={corretor.nome} />
                                : corretor.nome.charAt(0)
                            }
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">{corretor.nome}</h2>
                            <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block',
                                corretor.ativo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                            )}>
                                {corretor.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 text-text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Contato */}
                    {(corretor.telefone || corretor.email) && (
                        <div className="flex flex-wrap gap-2">
                            {corretor.telefone && (
                                <a href={`tel:${corretor.telefone}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary bg-black/[0.03] px-3 py-2 rounded-lg hover:bg-black/[0.06] transition-colors">
                                    <Phone size={14} className="text-brand" />
                                    {corretor.telefone}
                                </a>
                            )}
                            {corretor.email && (
                                <a href={`mailto:${corretor.email}`}
                                    className="flex items-center gap-2 text-sm text-text-secondary bg-black/[0.03] px-3 py-2 rounded-lg hover:bg-black/[0.06] transition-colors">
                                    <Mail size={14} className="text-brand" />
                                    {corretor.email}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Alerta leads parados */}
                    {stats.novos > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                            <AlertCircle size={15} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-800 font-medium">
                                {stats.novos} lead{stats.novos > 1 ? 's' : ''} sem contato pendente{stats.novos > 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {/* KPIs de processo */}
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Atividades do período</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Contatos', value: stats.contatos, icon: PhoneCall, color: 'text-brand' },
                                { label: 'Follow-ups', value: stats.followUps, icon: MessageSquare, color: 'text-violet-500' },
                                { label: 'Visitas', value: stats.visitas, icon: CalendarCheck, color: 'text-emerald-600' },
                                { label: 'SLA Médio', value: `${stats.slaAvg}min`, icon: Clock, color: stats.slaAvg <= 5 ? 'text-green-600' : stats.slaAvg <= 10 ? 'text-amber-500' : 'text-red-500' },
                            ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-black/[0.02] rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Icon size={13} className={color} />
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
                                    </div>
                                    <p className="text-lg font-bold">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Venda — celebratória */}
                        {stats.vendas > 0 && (
                            <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200">
                                <Trophy size={20} className="text-yellow-500 shrink-0" fill="currentColor" />
                                <div>
                                    <p className="text-sm font-bold text-yellow-700">
                                        {stats.vendas === 1 ? '1 venda fechada!' : `${stats.vendas} vendas fechadas!`}
                                    </p>
                                    <p className="text-[10px] text-yellow-600">Resultado do processo bem executado 🎉</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metas internas */}
                    {stats.meta && (
                        <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Target size={12} />
                                Metas Internas (Mês)
                            </p>
                            <div className="space-y-3">
                                {/* Meta vendas */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-text-secondary">Vendas</span>
                                        <span className="text-sm font-semibold">
                                            <span className={stats.vendas >= stats.meta.vendasMes ? 'text-green-600' : ''}>{stats.vendas}</span>
                                            <span className="text-text-muted font-normal"> / {stats.meta.vendasMes}</span>
                                        </span>
                                    </div>
                                    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all', stats.vendas >= stats.meta.vendasMes ? 'bg-green-500' : 'bg-brand')}
                                            style={{ width: `${Math.min((stats.vendas / stats.meta.vendasMes) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                {/* Meta SLA */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-text-secondary">SLA (meta: ≤{stats.meta.slaMaxMin}min)</span>
                                        <span className={cn('text-sm font-semibold', stats.slaAvg <= stats.meta.slaMaxMin ? 'text-green-600' : 'text-red-500')}>
                                            {stats.slaAvg}min
                                        </span>
                                    </div>
                                    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all', stats.slaAvg <= stats.meta.slaMaxMin ? 'bg-green-500' : 'bg-red-500')}
                                            style={{ width: `${Math.min((stats.meta.slaMaxMin / Math.max(stats.slaAvg, 1)) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                {/* Meta conversão */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-text-secondary">Conversão (meta: {stats.meta.conversaoPct}%)</span>
                                        <span className={cn('text-sm font-semibold', stats.conversao >= stats.meta.conversaoPct ? 'text-green-600' : '')}>
                                            {stats.conversao}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all', stats.conversao >= stats.meta.conversaoPct ? 'bg-green-500' : 'bg-brand')}
                                            style={{ width: `${Math.min((stats.conversao / stats.meta.conversaoPct) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empreendimentos que atende */}
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Building2 size={12} />
                            Empreendimentos Atribuídos
                        </p>
                        <div className="space-y-2">
                            {empsDaImob.map(emp => {
                                const isAtivo = empsAtivos.includes(emp.id);
                                return (
                                    <button
                                        key={emp.id}
                                        onClick={() => toggleEmp(emp.id)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left',
                                            isAtivo
                                                ? 'border-brand/30 bg-brand/5'
                                                : 'border-border bg-transparent hover:bg-black/[0.02]'
                                        )}
                                    >
                                        {isAtivo
                                            ? <CheckCircle2 size={16} className="text-brand shrink-0" />
                                            : <Circle size={16} className="text-text-muted shrink-0" />
                                        }
                                        <span className={cn('text-sm font-medium flex-1', isAtivo ? 'text-brand' : 'text-text-secondary')}>
                                            {emp.nome}
                                        </span>
                                        <span className="text-[10px] text-text-muted">{emp.cidade}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-text-muted mt-2">Clique para ativar/desativar empreendimentos da roleta</p>
                    </div>

                    {/* Leads ativos recentes */}
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                            Leads ativos
                        </p>
                        <div className="space-y-1.5">
                            {stats.cLeads
                                .filter(l => !['perdido', 'venda'].includes(l.status))
                                .slice(0, 5)
                                .map(l => (
                                    <div key={l.id} className="flex items-center gap-2 py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                                        <span className="text-sm text-text-secondary flex-1 truncate">{l.nome}</span>
                                        <span className="text-[10px] text-text-muted capitalize">{l.status.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            {stats.cLeads.filter(l => !['perdido', 'venda'].includes(l.status)).length === 0 && (
                                <p className="text-xs text-text-muted">Nenhum lead ativo no momento</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer de ações */}
                <div className="p-4 border-t border-border bg-bg shrink-0 flex gap-2">
                    <Button variant="secondary" className="flex-1 h-10">
                        {corretor.ativo ? 'Desativar Corretor' : 'Reativar Corretor'}
                    </Button>
                    <Button className="flex-1 h-10">
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </>
    );
}

// --- Página principal ---
export function Corretores() {
    const imobCorretores = corretores.filter(c => c.imobiliariaId === IMOB_ID);
    const [selected, setSelected] = useState<Corretor | null>(null);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Corretores</h1>
                        <p className="text-text-secondary text-sm mt-1">
                            {imobCorretores.filter(c => c.ativo).length} ativos · {imobCorretores.length} total — Imobiliária Prime
                        </p>
                    </div>
                    <Button className="self-start sm:self-auto gap-2">
                        <Plus size={16} />
                        Novo Corretor
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imobCorretores.map(c => {
                        const stats = calcStats(c);

                        return (
                            <Card
                                key={c.id}
                                variant="hover"
                                className={cn(
                                    'p-5 cursor-pointer transition-all',
                                    !c.ativo && 'opacity-70'
                                )}
                                onClick={() => setSelected(c)}
                            >
                                {/* Header do card */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold overflow-hidden shrink-0">
                                            {c.avatarUrl
                                                ? <img src={c.avatarUrl} className="w-full h-full object-cover" alt={c.nome} />
                                                : c.nome.charAt(0)
                                            }
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{c.nome}</h3>
                                            <span className={cn(
                                                'text-xs px-2 py-0.5 rounded-full',
                                                c.ativo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {c.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                    {stats.novos > 0 && (
                                        <div className="text-amber-500" title={`${stats.novos} lead(s) pendentes`}>
                                            <AlertCircle size={18} />
                                        </div>
                                    )}
                                </div>

                                {/* Métricas nos cards da listagem */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-brand">{stats.contatos}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Contatos</p>
                                    </div>
                                    <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-violet-600">{stats.followUps}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Follow-ups</p>
                                    </div>
                                    <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-emerald-600">{stats.visitas}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider">Visitas</p>
                                    </div>
                                    <div className="bg-black/[0.02] rounded-lg p-3 text-center">
                                        <p className={cn('text-lg font-bold', stats.slaAvg <= 5 ? 'text-green-600' : stats.slaAvg <= 10 ? 'text-amber-500' : 'text-red-500')}>
                                            {stats.slaAvg}m
                                        </p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider">SLA</p>
                                    </div>
                                </div>

                                {/* Meta de vendas */}
                                {stats.meta && (
                                    <div className="mt-3 pt-3 border-t border-border/60">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Meta de Vendas</span>
                                            <span className="text-xs font-semibold">
                                                <span className={stats.vendas >= stats.meta.vendasMes ? 'text-green-600' : ''}>{stats.vendas}</span>
                                                <span className="text-text-muted">/{stats.meta.vendasMes}</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full', stats.vendas >= stats.meta.vendasMes ? 'bg-green-500' : 'bg-brand')}
                                                style={{ width: `${Math.min((stats.vendas / stats.meta.vendasMes) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Empreendimentos atribuídos */}
                                {(c.empreendimentoIds ?? []).length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {(c.empreendimentoIds ?? []).slice(0, 2).map(empId => {
                                            const emp = empreendimentos.find(e => e.id === empId);
                                            return emp ? (
                                                <span key={empId} className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                                    {emp.nome.split(' ').slice(-1)[0]}
                                                </span>
                                            ) : null;
                                        })}
                                        {(c.empreendimentoIds ?? []).length > 2 && (
                                            <span className="text-[10px] bg-black/5 text-text-muted px-2 py-0.5 rounded-full">
                                                +{(c.empreendimentoIds ?? []).length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <p className="text-[10px] text-text-muted text-right mt-3">Clique para detalhes →</p>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Drawer */}
            {selected && (
                <CorretorDrawer
                    corretor={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}

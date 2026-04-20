import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, MessageSquarePlus, Send, Ban, Clock, Zap, ArrowRight, Calendar, CheckCircle2, XCircle, Share2, PhoneMissed, PhoneOff, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Timeline } from '../../components/ui/Timeline';
import { TagTextarea, detectCompoundTags, detectSimpleTags, sentimentoConfig, type DetectedCompoundTag, type DetectedSimpleTag } from '../../components/ui/TagTextarea';
import { StatusPipeline } from '../../components/ui/StatusPipeline';
import { useApp } from '../../context/AppContext';
import {
    leads,
    getEmpreendimento,
    statusLabels,
    type LeadStatus,
} from '../../data/mockData';
import { triggerReward } from '../../utils/confetti';

interface Nota {
    id: string;
    texto: string;
    compound: DetectedCompoundTag[];
    simple: DetectedSimpleTag[];
    data: string;
    statusDe?: LeadStatus;
    statusPara?: LeadStatus;
}

const statusFlow: LeadStatus[] = ['novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda'];

// ============================
// SLA Helper
// ============================
function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}min`;
    if (hours > 0) return `${hours}h ${minutes}min`;
    if (minutes > 0) return `${minutes}min ${seconds}s`;
    return `${seconds}s`;
}

export function LeadDetalhe() {
    const { selectedLeadId, setCurrentPage } = useApp();
    const [showLostModal, setShowLostModal] = useState(false);
    const [motivoPerdido, setMotivoPerdido] = useState('');
    const [notaTexto, setNotaTexto] = useState('');
    const [visitFeedback, setVisitFeedback] = useState('');
    const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
    const [xpReward, setXpReward] = useState<number | null>(null);
    const [dataVisita, setDataVisita] = useState('');
    const [horaVisita, setHoraVisita] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [notas, setNotas] = useState<Nota[]>([
        {
            id: 'nota-1',
            texto: 'Primeiro contato feito por ligação. Lead interessado no 2 quartos, perguntou sobre financiamento. Achou a entrada cara.',
            compound: detectCompoundTags('Primeiro contato feito por ligação. Lead interessado no 2 quartos, perguntou sobre financiamento. Achou a entrada cara.'),
            simple: detectSimpleTags('Primeiro contato feito por ligação. Lead interessado no 2 quartos, perguntou sobre financiamento. Achou a entrada cara.'),
            data: new Date(Date.now() - 3600000).toISOString(),
            statusDe: 'novo',
            statusPara: 'contatado',
        },
    ]);
    const [tentativasContato, setTentativasContato] = useState(0);
    const [autoCloseWarning, setAutoCloseWarning] = useState(false);

    // Live SLA timer
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const salvarNota = () => {
        if (!notaTexto.trim()) return;
        const nova: Nota = {
            id: `nota-${Date.now()}`,
            texto: notaTexto,
            compound: detectCompoundTags(notaTexto),
            simple: detectSimpleTags(notaTexto),
            data: new Date().toISOString(),
            statusDe: pendingStatus ? statusFlow[statusFlow.indexOf(pendingStatus) - 1] || lead!.status : undefined,
            statusPara: pendingStatus || undefined,
        };
        if (pendingStatus) {
            triggerReward();
            setXpReward(100);
            setTimeout(() => setXpReward(null), 2000);

            if (pendingStatus === 'visita_marcada' && dataVisita && horaVisita) {
                // Mutate mock data for demo
                lead!.dataVisita = `${dataVisita}T${horaVisita}:00`;
                lead!.status = pendingStatus; // Force status update
            } else {
                lead!.status = pendingStatus;
            }
        } else {
            setXpReward(10);
            setTimeout(() => setXpReward(null), 2000);
        }
        setNotas([nova, ...notas]);
        setNotaTexto('');
        setPendingStatus(null);
        setDataVisita('');
        setHoraVisita('');
    };

    const handleConfirmVisit = () => {
        triggerReward();
        setXpReward(300);
        setTimeout(() => setXpReward(null), 3000);

        const feedback = visitFeedback.trim() ? visitFeedback : 'Sem observações adicionais.';

        const nova: Nota = {
            id: `nota-${Date.now()}`,
            texto: `✅ VISITA REALIZADA com sucesso!\nFeedback: ${feedback}`,
            compound: detectCompoundTags(feedback),
            simple: detectSimpleTags(feedback),
            data: new Date().toISOString(),
            statusDe: 'visita_marcada',
            statusPara: 'visita_marcada',
        };

        setNotas([nova, ...notas]);
        setVisitFeedback('');

        if (lead) {
            // Mock update to hide the card
            lead.dataVisita = undefined;
        }
    };

    const handleStatusClick = (status: LeadStatus) => {
        if (status === 'em_atendimento') {
            // Immediate update for "Iniciar Atendimento"
            triggerReward();
            setXpReward(50);
            setTimeout(() => setXpReward(null), 2000);

            // Update lead status directly (mock)
            lead!.status = status;

            // Add auto system note
            const nova: Nota = {
                id: `nota-${Date.now()}`,
                texto: '⚡ Atendimento iniciado',
                compound: [],
                simple: [],
                data: new Date().toISOString(),
                statusDe: 'novo',
                statusPara: 'em_atendimento',
            };
            setNotas([nova, ...notas]);
            return;
        }

        setPendingStatus(status);
        // Scroll to textarea
        setTimeout(() => {
            const el = document.getElementById('registro-contato');
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleNoAnswer = () => {
        const novasTentativas = tentativasContato + 1;
        setTentativasContato(novasTentativas);

        // Add auto system note
        const nova: Nota = {
            id: `nota-${Date.now()}`,
            texto: `📞 Tentativa de contato ${novasTentativas}/3 falhou (Cliente não atendeu).`,
            compound: [],
            simple: [],
            data: new Date().toISOString(),
            statusDe: 'em_atendimento',
            statusPara: 'em_atendimento',
        };
        setNotas([nova, ...notas]);

        if (novasTentativas >= 3) {
            // Suggest lost
            setShowLostModal(true);
            setMotivoPerdido('Sem contato após 3 tentativas');
        }
    };



    const cancelStatusChange = () => {
        setPendingStatus(null);
    };

    const lead = leads.find(l => l.id === selectedLeadId);

    // Simulate Auto-Close check on mount
    useEffect(() => {
        if (lead?.status === 'em_atendimento') {
            // Mock logic: randomly decide if this lead is "stale" for demo purposes
            // In real app, check (now - lead.lastUpdate > 48h)
            const isStale = Math.random() > 0.8; // 20% chance of being stale for demo
            if (isStale) {
                setAutoCloseWarning(true);
            }
        }
    }, [lead]);

    if (!lead) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted">Lead não encontrado</p>
                <Button variant="secondary" className="mt-4" onClick={() => setCurrentPage('meus-leads')}>
                    Voltar
                </Button>
            </div>
        );
    }

    const emp = getEmpreendimento(lead.empreendimentoId);

    const isPerdido = lead.status === 'perdido';
    const currentIdx = statusFlow.indexOf(lead.status);
    const nextStatus = statusFlow[currentIdx + 1];


    // SLA calculations
    const SLA_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
    const isNew = lead.status === 'novo' && !lead.firstResponseAt;
    const elapsedMs = isNew ? now - new Date(lead.criadoEm).getTime() : 0;

    const slaPercent = isNew ? Math.min((elapsedMs / SLA_LIMIT_MS) * 100, 100) : 0;
    const slaEstourado = isNew && elapsedMs > SLA_LIMIT_MS;
    const slaWarning = isNew && elapsedMs > SLA_LIMIT_MS * 0.6 && !slaEstourado;

    const goBack = () => {
        setCurrentPage('meus-leads');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto relative">
            {/* Auto-Close Warning Banner */}
            {autoCloseWarning && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-bold text-red-900">Atendimento Encerrado Automaticamente</h3>
                        <p className="text-xs text-red-700 mt-1">
                            Este lead ficou mais de 48h sem interação enquanto estava "Em Atendimento".
                            O sistema encerrou preventivamente para manter o SLA da equipe.
                        </p>
                        <button
                            className="mt-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                            onClick={() => {
                                setShowLostModal(true);
                                setMotivoPerdido('Inatividade (Auto-Close)');
                            }}
                        >
                            Confirmar Perda
                        </button>
                    </div>
                </div>
            )}
            {/* Reward Animation */}
            {xpReward && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
                    <span className="text-6xl">🎉</span>
                    <span className="text-4xl font-black text-brand drop-shadow-lg bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm border border-brand/20">
                        +{xpReward} XP
                    </span>
                </div>
            )}

            {/* Back button */}
            <button onClick={goBack} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer">
                <ArrowLeft size={16} />
                Voltar para Meus Leads
            </button>

            {/* SLA Banner — friendly coach style */}
            {isNew && (
                <div className={`rounded-xl border p-4 transition-all ${slaEstourado
                    ? 'border-amber-200 bg-amber-50/80'
                    : slaWarning
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-brand/20 bg-brand/5'
                    }`}>
                    <div className="flex items-start justify-between mb-2.5">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {slaEstourado ? (
                                    <span className="text-lg">☕</span>
                                ) : slaWarning ? (
                                    <Clock size={16} className="text-amber-600" />
                                ) : (
                                    <span className="text-lg">🚀</span>
                                )}
                                <span className={`text-sm font-semibold ${slaEstourado ? 'text-amber-800' : slaWarning ? 'text-amber-700' : 'text-brand'
                                    }`}>
                                    {slaEstourado
                                        ? 'Esse lead tá esperando faz tempo!'
                                        : slaWarning
                                            ? 'O tempo tá correndo...'
                                            : 'Lead quentinho! 🔥'
                                    }
                                </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${slaEstourado ? 'text-amber-700' : 'text-text-secondary'
                                }`}>
                                {slaEstourado
                                    ? `O tempo de resposta ideal é de 10 min — já fazem ${formatElapsed(elapsedMs)}. Bora atender! 💪`
                                    : slaWarning
                                        ? `A meta é responder em até 10 min. Já fazem ${formatElapsed(elapsedMs)}, bora lá!`
                                        : `Lead recebido há ${formatElapsed(elapsedMs)}. A meta de resposta é de 10 min — você tá no ritmo!`
                                }
                            </p>
                        </div>
                        <span className={`text-lg font-bold tabular-nums ml-4 ${slaEstourado ? 'text-amber-700' : slaWarning ? 'text-amber-600' : 'text-text-primary'
                            }`}>
                            {formatElapsed(elapsedMs)}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${slaEstourado ? 'bg-amber-400' : slaWarning ? 'bg-amber-400' : 'bg-brand'
                                }`}
                            style={{ width: `${Math.min(slaPercent, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-text-muted">agora</span>
                        <span className="text-[10px] text-text-muted">meta: 10 min</span>
                    </div>
                </div>
            )}

            {/* Lead header */}
            <Card className="p-4 sm:p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xl shrink-0">
                        {lead.nome.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl font-bold leading-tight">{lead.nome}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <StatusBadge status={lead.status} />
                            <button
                                onClick={() => {
                                    const url = `${window.location.protocol}//${window.location.host}/#/apresentacao/${lead.publicToken || 'demo'}`;
                                    const msg = `Olá ${lead.nome.split(' ')[0]}, preparei uma apresentação exclusiva do ${emp?.nome} para você: ${url}`;

                                    navigator.clipboard.writeText(msg);

                                    setLinkCopied(true);
                                    setTimeout(() => setLinkCopied(false), 2000);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${linkCopied
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-brand/10 text-brand hover:bg-brand/20'
                                    }`}
                                title="Copiar Link da Apresentação"
                            >
                                {linkCopied ? <CheckCircle2 size={12} /> : <Share2 size={12} />}
                                {linkCopied ? 'Copiado!' : 'Copiar Link'}
                            </button>
                            {isPerdido && lead.motivoPerdido && (
                                <span className="text-xs text-red-500">— {lead.motivoPerdido}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {lead.dataVisita && (
                        <div className="col-span-full bg-violet-50 text-violet-700 p-3 rounded-xl flex items-center gap-3 border border-violet-100 animate-in slide-in-from-top-2">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Visita Agendada</p>
                                <p className="font-bold text-lg leading-none mt-0.5">
                                    {new Date(lead.dataVisita).toLocaleDateString('pt-BR')} <span className="text-sm font-normal opacity-80">às {new Date(lead.dataVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                            </div>
                        </div>
                    )}
                    <a
                        href={`tel:${lead.telefone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-colors"
                    >
                        <Phone size={18} className="text-brand" />
                        <div>
                            <p className="text-xs text-text-muted">Telefone</p>
                            <p className="font-semibold text-brand">{lead.telefone}</p>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-border">
                        <MapPin size={18} className="text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">Empreendimento</p>
                            <p className="font-medium">{emp?.nome}</p>
                        </div>
                    </div>
                </div>

                {/* Visit Confirmation Card */}
                {
                    !isPerdido && lead.status === 'visita_marcada' && lead.dataVisita && new Date(lead.dataVisita) < new Date() && (
                        <div className="mb-6 bg-brand/5 border border-brand/20 rounded-xl p-5 animate-in slide-in-from-top-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-brand text-white rounded-lg shadow-sm">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-brand-dark mb-1">A visita já ocorreu?</h3>
                                    <p className="text-sm text-text-secondary mb-4">
                                        O horário agend ({new Date(lead.dataVisita).toLocaleString('pt-BR')}) já passou. Confirme se a visita foi realizada para manter o histórico atualizado.
                                    </p>

                                    <div className="space-y-3">
                                        <textarea
                                            value={visitFeedback}
                                            onChange={e => setVisitFeedback(e.target.value)}
                                            placeholder="Como foi a visita? O cliente gostou? Alguma objeção?"
                                            className="w-full text-sm rounded-lg border border-brand/20 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none h-20"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleConfirmVisit}
                                                className="flex-1 bg-brand text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} />
                                                Confirmar Realização
                                            </button>
                                            <button className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                                                <XCircle size={18} />
                                                Não ocorreu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Status Pipeline */}
                {
                    !isPerdido && (
                        <div className="mb-2">
                            <div className="mb-6">
                                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">Fluxo de Atendimento</p>
                                <StatusPipeline
                                    currentStatus={lead.status}
                                    statusList={statusFlow}
                                    onStatusClick={handleStatusClick}
                                />
                            </div>

                            {/* Botão de Ação Principal - Próxima Etapa */}
                            {nextStatus && (
                                <div className="space-y-3 mt-4 mb-2">
                                    <button
                                        onClick={() => handleStatusClick(nextStatus)}
                                        disabled={autoCloseWarning || (lead.status === 'em_atendimento' && tentativasContato >= 3)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${nextStatus === 'em_atendimento'
                                            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
                                            : 'bg-brand hover:bg-brand-dark'
                                            }`}
                                    >
                                        {nextStatus === 'em_atendimento' ? (
                                            <>
                                                <Zap size={18} className="fill-white" />
                                                <span>Iniciar Atendimento</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Avançar para {statusLabels[nextStatus]}</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {/* Botão de Falha no Contato (Só aparece em 'em_atendimento') */}
                                    {lead.status === 'em_atendimento' && !autoCloseWarning && (
                                        <button
                                            onClick={handleNoAnswer}
                                            disabled={tentativasContato >= 3}
                                            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all border ${tentativasContato >= 2
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                                }`}
                                        >
                                            {tentativasContato >= 3 ? (
                                                <>
                                                    <PhoneOff size={16} />
                                                    <span>Sem contato (Limite atingido)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <PhoneMissed size={16} />
                                                    <span>Cliente não atendeu ({tentativasContato}/3)</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Finalizar atendimento */}
                            {!showLostModal ? (
                                <button
                                    onClick={() => setShowLostModal(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all shadow-sm hover:shadow"
                                >
                                    <Ban size={18} />
                                    Encerrar Atendimento (Perdido)
                                </button>
                            ) : (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-sm font-medium text-red-900 mb-3">Motivo da perda <span className="text-red-600">*</span></p>
                                    <textarea
                                        value={motivoPerdido}
                                        onChange={e => setMotivoPerdido(e.target.value)}
                                        placeholder="Descreva o motivo pelo qual o lead foi perdido..."
                                        className="w-full text-sm rounded-lg border border-red-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none h-20 mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            className="flex-1 bg-white hover:bg-red-100 text-red-700 border-red-200"
                                            onClick={() => { setShowLostModal(false); setMotivoPerdido(''); }}
                                        >
                                            Cancelar
                                        </Button>
                                        <button
                                            disabled={!motivoPerdido.trim()}
                                            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            Confirmar Perda
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </Card >

            {/* Registro de Contato */}
            < Card className="p-6" id="registro-contato" >
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquarePlus size={18} className="text-brand" />
                    <div>
                        <h2 className="text-base font-semibold">Anotações e Histórico</h2>
                    </div>
                </div>

                {
                    !isPerdido && (
                        <div className="mb-8">
                            {pendingStatus && (
                                <div className="flex items-center justify-between mb-2 animate-in slide-in-from-top-2 fade-in">
                                    <span className="text-sm font-semibold text-brand flex items-center gap-2">
                                        <Zap size={14} />
                                        Motivo da mudança para <span className="underline decoration-brand/30 underline-offset-2">{statusLabels[pendingStatus]}</span>
                                    </span>
                                    <button onClick={cancelStatusChange} className="text-xs text-text-muted hover:text-red-500 transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            {pendingStatus === 'visita_marcada' && (
                                <div className="flex flex-col sm:flex-row gap-4 mb-4 animate-in slide-in-from-top-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">Data da Visita <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-xl focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition-all shadow-sm group">
                                            <Calendar size={18} className="text-text-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="date"
                                                className="w-full bg-transparent border-none outline-none text-sm text-text-primary"
                                                value={dataVisita}
                                                onChange={e => setDataVisita(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">Horário <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-xl focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 transition-all shadow-sm group">
                                            <Clock size={18} className="text-text-muted group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="time"
                                                className="w-full bg-transparent border-none outline-none text-sm text-text-primary"
                                                value={horaVisita}
                                                onChange={e => setHoraVisita(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="transition-all duration-300">
                                <TagTextarea
                                    value={notaTexto}
                                    onChange={setNotaTexto}
                                    placeholder={pendingStatus ? "Descreva o que foi conversado..." : "Registre aqui novos contatos, dúvidas ou feedbacks..."}
                                    className={pendingStatus ? "[&_textarea]:border-brand [&_textarea]:ring-4 [&_textarea]:ring-brand/10 transition-all" : "transition-all"}
                                />
                            </div>

                            <div className="flex justify-end mt-2">
                                <Button
                                    onClick={salvarNota}
                                    disabled={!notaTexto.trim() || (pendingStatus === 'visita_marcada' && (!dataVisita || !horaVisita))}
                                    className={`gap-2 transition-all ${pendingStatus ? 'w-full justify-center bg-brand hover:bg-brand-dark' : ''}`}
                                >
                                    <Send size={14} />
                                    {pendingStatus
                                        ? `Confirmar: ${statusLabels[pendingStatus]}`
                                        : 'Salvar Nota'
                                    }
                                </Button>
                            </div>
                        </div>
                    )
                }

                {/* Notas salvas */}
                {
                    notas.length > 0 && (
                        <div className="space-y-0">
                            {notas.map(nota => {
                                const hasInsights = nota.compound.length > 0 || nota.simple.length > 0;
                                return (
                                    <div key={nota.id} className="py-4 border-b border-border/40 last:border-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <div className="flex flex-col gap-1">
                                                {nota.statusDe && nota.statusPara && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/5 px-2 py-0.5 rounded-full border border-brand/10">
                                                            {statusLabels[nota.statusPara]}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted">
                                                            (de {statusLabels[nota.statusDe]})
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm text-text-primary leading-relaxed">{nota.texto}</p>
                                            </div>
                                            <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0 pt-1">
                                                {new Date(nota.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {hasInsights && (
                                            <div className="flex flex-wrap gap-1.5 mt-2 opacity-80 hover:opacity-100 transition-opacity">
                                                {nota.compound.map((ct, i) => {
                                                    const config = sentimentoConfig[ct.sentimento];
                                                    return (
                                                        <span key={`c-${i}`} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
                                                            {config.icon}
                                                            {ct.assunto}
                                                        </span>
                                                    );
                                                })}
                                                {nota.simple.map((st, i) => (
                                                    <span key={`s-${i}`} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${st.cor}`}>
                                                        {st.icon} {st.tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </Card >

            {/* Lost button */}


            {/* Timeline */}
            <Card className="p-6">
                <h2 className="text-base font-semibold mb-4">Histórico</h2>
                <Timeline items={lead.historico} />
            </Card>
        </div >
    );
}

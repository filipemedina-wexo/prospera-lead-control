import { useEffect } from 'react';
import { X, Phone, MapPin, User, MessageCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Timeline } from './Timeline';
import {
    leads,
    getEmpreendimento,
    getCorretor,
} from '../../data/mockData';

interface LeadDrawerProps {
    leadId: string | null;
    onClose: () => void;
}

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
    const lead = leadId ? leads.find(l => l.id === leadId) : null;
    const emp = lead ? getEmpreendimento(lead.empreendimentoId) : null;
    const cor = lead ? getCorretor(lead.corretorId) : null;

    // Fechar com ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Bloquear scroll do body quando aberto
    useEffect(() => {
        if (leadId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [leadId]);

    if (!leadId) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-surface border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-base shrink-0">
                            {lead?.nome.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-text-primary truncate">{lead?.nome ?? 'Lead não encontrado'}</p>
                            {lead && <StatusBadge status={lead.status} className="mt-0.5" />}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-black/5 hover:text-text-primary transition-colors cursor-pointer"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {!lead ? (
                        <p className="text-text-muted text-sm text-center py-8">Lead não encontrado.</p>
                    ) : (
                        <>
                            {/* Contato */}
                            <section className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Contato</p>
                                <a
                                    href={`tel:${lead.telefone}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-colors"
                                >
                                    <Phone size={16} className="text-brand shrink-0" />
                                    <span className="text-sm font-semibold text-brand">{lead.telefone}</span>
                                </a>
                                <a
                                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle size={16} className="text-green-600 shrink-0" />
                                    <span className="text-sm font-semibold text-green-700">WhatsApp</span>
                                </a>
                            </section>

                            {/* Info */}
                            <section className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Dados do Lead</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-border">
                                        <MapPin size={16} className="text-text-muted shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">Empreendimento</p>
                                            <p className="text-sm font-medium">{emp?.nome ?? '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-border">
                                        <User size={16} className="text-text-muted shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">Corretor Responsável</p>
                                            <p className="text-sm font-medium">{cor?.nome ?? '—'}</p>
                                        </div>
                                    </div>
                                    {lead.motivoPerdido && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                            <p className="text-[10px] text-red-500 uppercase tracking-wider font-bold mb-0.5">Motivo da Perda</p>
                                            <p className="text-sm text-red-700">{lead.motivoPerdido}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <div className="flex-1 p-3 rounded-xl bg-black/[0.02] border border-border text-center">
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">Recebido em</p>
                                            <p className="text-xs font-semibold mt-0.5">
                                                {new Date(lead.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-xl bg-black/[0.02] border border-border text-center">
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">1º Contato</p>
                                            <p className="text-xs font-semibold mt-0.5">
                                                {lead.firstResponseAt
                                                    ? new Date(lead.firstResponseAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Histórico */}
                            <section>
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Histórico</p>
                                <Timeline items={lead.historico} />
                            </section>
                        </>
                    )}
                </div>

                {/* Footer — somente leitura (visão gerencial) */}
                <div className="px-5 py-3 border-t border-border shrink-0">
                    <p className="text-[10px] text-text-muted text-center">Visão somente leitura — ações disponíveis na tela do Corretor</p>
                </div>
            </div>
        </>
    );
}

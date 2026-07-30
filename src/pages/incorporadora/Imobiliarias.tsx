import { Users, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import { imobiliarias, corretores, leads, getSlaMinutes } from '../../data/mockData';
import { cn } from '../../lib/utils';

export function Imobiliarias() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteSent, setInviteSent] = useState(false);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteSent(true);
        setTimeout(() => {
            setShowInvite(false);
            setInviteSent(false);
            setInviteEmail('');
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Imobiliárias</h1>
                    <p className="text-text-secondary text-sm mt-1">{imobiliarias.length} parceiras ativas</p>
                </div>
                <Button onClick={() => setShowInvite(true)} className="self-start sm:self-auto">
                    <Plus size={16} className="mr-2" />
                    Convidar Imobiliária
                </Button>
            </div>

            {showInvite && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-2">Convidar Imobiliária Parceira</h2>
                        <p className="text-sm text-text-muted mb-6">
                            Envie um convite para que o próprio gestor cadastre os dados da imobiliária na rede.
                        </p>
                        
                        {inviteSent ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
                                <p className="font-semibold">Convite enviado com sucesso!</p>
                                <p className="text-sm mt-1">O gestor já pode acessar o link e criar a conta.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail do Gestor</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        placeholder="gestor@imobiliaria.com.br"
                                        className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowInvite(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        Enviar Convite
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            )}

            <div className="space-y-4">
                {imobiliarias.map(imob => {
                    const imobCorretores = corretores.filter(c => c.imobiliariaId === imob.id);
                    const ativos = imobCorretores.filter(c => c.ativo).length;
                    const imobLeads = leads.filter(l => l.imobiliariaId === imob.id);
                    const withResp = imobLeads.filter(l => l.firstResponseAt);
                    const avgSla = withResp.length > 0
                        ? Math.round(withResp.reduce((s, l) => s + (getSlaMinutes(l) || 0), 0) / withResp.length)
                        : 0;
                    const expanded = expandedId === imob.id;

                    return (
                        <Card key={imob.id} variant="hover" className="p-0 overflow-hidden">
                            <button
                                onClick={() => setExpandedId(expanded ? null : imob.id)}
                                className="w-full px-6 py-5 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                        <span className="font-bold text-sm">{imob.nome.charAt(0)}</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold">{imob.nome}</h3>
                                        <p className="text-sm text-text-muted">{ativos} corretores ativos</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-1.5 text-text-secondary">
                                            <Users size={14} />
                                            <span>{imobLeads.length} leads</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-text-secondary">
                                            <Clock size={14} />
                                            <span>SLA: {avgSla} min</span>
                                        </div>
                                    </div>
                                    {expanded ? <ChevronUp size={18} className="text-text-muted" /> : <ChevronDown size={18} className="text-text-muted" />}
                                </div>
                            </button>

                            {expanded && (
                                <div className="border-t border-border px-6 py-4">
                                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">Corretores</p>
                                    <div className="space-y-2">
                                        {imobCorretores.map(c => {
                                            const cLeads = leads.filter(l => l.corretorId === c.id);
                                            const cVendas = cLeads.filter(l => l.status === 'venda').length;
                                            return (
                                                <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-black/[0.02]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-bold">
                                                            {c.nome.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium">{c.nome}</span>
                                                            <span className={cn(
                                                                'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                                                                c.ativo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                                            )}>
                                                                {c.ativo ? 'Ativo' : 'Inativo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                                        <span>{cLeads.length} leads</span>
                                                        <span className="text-brand font-medium">{cVendas} vendas</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { User, Target, Bell, Save, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type Tab = 'perfil' | 'metas' | 'notificacoes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Meu Perfil', icon: <User size={16} /> },
    { id: 'metas', label: 'Metas', icon: <Target size={16} /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
];

export function ConfiguracoesCorretor() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil');
    const [saved, setSaved] = useState(false);

    // Perfil
    const [nome, setNome] = useState('João Mendes');
    const [email, setEmail] = useState('joao.mendes@imobprime.com.br');
    const [creci, setCreci] = useState('12345-F');

    // Metas
    const [slaMax] = useState(10);
    const [metaVisitas, setMetaVisitas] = useState(8);
    const [metaConversao, setMetaConversao] = useState(15);

    // Notificações - Email / Push
    const [notifNovoLead, setNotifNovoLead] = useState({ email: true, push: true });
    const [notifSlaEstourado, setNotifSlaEstourado] = useState({ email: true, push: true });
    const [notifVisitaHoje, setNotifVisitaHoje] = useState({ email: true, push: false });
    const [notifRanking, setNotifRanking] = useState({ email: false, push: true });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-text-secondary text-sm mt-1">Gerencie seu perfil de corretor, metas e preferências</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black/[0.04] rounded-xl p-1 w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white shadow text-text-primary'
                                : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* === Aba Perfil === */}
            {activeTab === 'perfil' && (
                <Card className="p-6 space-y-5">
                    <div className="flex items-center gap-4 pb-4 border-b border-border">
                        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold">
                            {nome.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{nome}</p>
                            <p className="text-text-muted text-sm">Corretor Autônomo</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome completo</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">CRECI</label>
                            <input
                                type="text"
                                value={creci}
                                onChange={e => setCreci(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Metas === */}
            {activeTab === 'metas' && (
                <Card className="p-6 space-y-5">
                    <p className="text-sm text-text-muted">Configure suas metas pessoais de performance. Os alertas do sistema serão baseados nestes valores.</p>

                    <div className="space-y-4">
                        <div className="bg-black/[0.02] border border-border p-3 rounded-xl">
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                SLA Máximo de Resposta <span className="text-text-muted font-normal">(minutos)</span>
                            </label>
                            <div className="font-semibold text-lg">{slaMax} min</div>
                            <p className="text-xs text-text-muted mt-0.5">Esse limite é exigido e configurado pela sua imobiliária</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Meta de Visitas <span className="text-text-muted font-normal">(por mês)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={metaVisitas}
                                onChange={e => setMetaVisitas(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Meta de Conversão <span className="text-text-muted font-normal">(%)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={metaConversao}
                                onChange={e => setMetaConversao(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                            <p className="text-xs text-text-muted mt-1">% de leads que você quer converter em vendas</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Notificações === */}
            {activeTab === 'notificacoes' && (
                <Card className="p-6 space-y-6">
                    <p className="text-sm text-text-muted">Escolha por quais canais você deseja receber seus alertas.</p>

                    <div className="space-y-0 divide-y divide-border/50 border border-border rounded-xl">
                        {[
                            { label: 'Novo Lead', desc: 'Notifique quando um novo lead for atribuído a você', state: notifNovoLead, setter: setNotifNovoLead },
                            { label: 'SLA Estourado', desc: 'Alerta quando um lead ultrapassar seu limite de tempo', state: notifSlaEstourado, setter: setNotifSlaEstourado },
                            { label: 'Visitas', desc: 'Lembrete das visitas agendadas no dia', state: notifVisitaHoje, setter: setNotifVisitaHoje },
                            { label: 'Ranking', desc: 'Sua posição mudou no ranking', state: notifRanking, setter: setNotifRanking },
                        ].map(({ label, desc, state, setter }) => (
                            <div key={label} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/[0.01]">
                                <div>
                                    <p className="font-medium text-sm">{label}</p>
                                    <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={state.email} 
                                            onChange={(e) => setter({...state, email: e.target.checked})}
                                            className="w-4 h-4 rounded text-brand focus:ring-brand" 
                                        />
                                        <span className="text-sm text-text-secondary">E-mail</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={state.push} 
                                            onChange={(e) => setter({...state, push: e.target.checked})}
                                            className="w-4 h-4 rounded text-brand focus:ring-brand" 
                                        />
                                        <span className="text-sm text-text-secondary">Navegador</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <Button onClick={handleSave} variant="primary" className="flex items-center gap-2">
                    {saved ? (
                        <>
                            <Check size={16} />
                            Salvo!
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Salvar alterações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { User, Target, Bell, Save, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type Tab = 'perfil' | 'metas' | 'notificacoes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Meu Perfil', icon: <User size={16} /> },
    { id: 'metas', label: 'Metas', icon: <Target size={16} /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
];

export function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil');
    const [saved, setSaved] = useState(false);

    // Perfil
    const [nome, setNome] = useState('João Mendes');
    const [email, setEmail] = useState('joao.mendes@imobprime.com.br');
    const [cargo, setCargo] = useState('Corretor de Imóveis');

    // Metas
    const [slaMax, setSlaMax] = useState(10);
    const [metaVisitas, setMetaVisitas] = useState(8);
    const [metaConversao, setMetaConversao] = useState(15);

    // Notificações
    const [notifNovoLead, setNotifNovoLead] = useState(true);
    const [notifSlaEstourado, setNotifSlaEstourado] = useState(true);
    const [notifVisitaHoje, setNotifVisitaHoje] = useState(true);
    const [notifRanking, setNotifRanking] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                <p className="text-text-secondary text-sm mt-1">Gerencie seu perfil, metas e preferências</p>
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
                            <p className="text-text-muted text-sm">{cargo}</p>
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
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Cargo</label>
                            <input
                                type="text"
                                value={cargo}
                                onChange={e => setCargo(e.target.value)}
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
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                SLA Máximo de Resposta <span className="text-text-muted font-normal">(minutos)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={60}
                                value={slaMax}
                                onChange={e => setSlaMax(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                            <p className="text-xs text-text-muted mt-1">Leads respondidos acima deste tempo serão sinalizados como SLA estourado</p>
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
                <Card className="p-6 space-y-4">
                    <p className="text-sm text-text-muted">Escolha quais alertas você deseja receber.</p>

                    {[
                        { label: 'Novo Lead atribuído', desc: 'Notifique quando um novo lead chegar para você', value: notifNovoLead, onChange: setNotifNovoLead },
                        { label: 'SLA estourado', desc: 'Alerta quando um lead ultrapassar seu limite de SLA', value: notifSlaEstourado, onChange: setNotifSlaEstourado },
                        { label: 'Visita do dia', desc: 'Lembrete das visitas agendadas para hoje', value: notifVisitaHoje, onChange: setNotifVisitaHoje },
                        { label: 'Atualização de ranking', desc: 'Notifique quando sua posição no ranking mudar', value: notifRanking, onChange: setNotifRanking },
                    ].map(({ label, desc, value, onChange }) => (
                        <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-black/[0.01] transition-colors">
                            <div>
                                <p className="font-medium text-sm">{label}</p>
                                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                            </div>
                            <button
                                onClick={() => onChange(!value)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-slate-200'
                                    }`}
                                role="switch"
                                aria-checked={value}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
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

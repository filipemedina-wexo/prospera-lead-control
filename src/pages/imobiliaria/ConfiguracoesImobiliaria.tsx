import { useState } from 'react';
import { Building2, Users, Sliders, Bell, Save, Check, Link } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type Tab = 'perfil' | 'equipe' | 'distribuicao' | 'integracoes' | 'notificacoes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Empresa', icon: <Building2 size={16} /> },
    { id: 'equipe', label: 'Equipe', icon: <Users size={16} /> },
    { id: 'distribuicao', label: 'Distribuição', icon: <Sliders size={16} /> },
    { id: 'integracoes', label: 'Integrações', icon: <Link size={16} /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
];

export function ConfiguracoesImobiliaria() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil');
    const [saved, setSaved] = useState(false);

    // Perfil
    const [nome, setNome] = useState('Imobiliária Prime');
    const [creci, setCreci] = useState('12345-J');
    const [email, setEmail] = useState('contato@imobprime.com.br');
    const [telefone, setTelefone] = useState('(11) 9999-9999');

    // Equipe/Metas Globais
    const [metaVendas, setMetaVendas] = useState(25);
    const [metaVisitas, setMetaVisitas] = useState(100);

    // Distribuição
    const [roletaAtiva, setRoletaAtiva] = useState(true);

    // Notificações - Email / Push
    const [notifSlaEstourado, setNotifSlaEstourado] = useState({ email: true, push: true });
    const [notifNovoLeadQuente, setNotifNovoLeadQuente] = useState({ email: true, push: true });
    const [notifMetaAtingida, setNotifMetaAtingida] = useState({ email: true, push: false });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Imobiliária</h1>
                <p className="text-text-secondary text-sm mt-1">Gerencie o perfil da empresa, metas globais e regras de equipe</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black/[0.04] rounded-xl p-1 w-fit flex-wrap">
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
                        <div className="w-16 h-16 rounded-xl bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold">
                            {nome.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{nome}</p>
                            <p className="text-text-muted text-sm cursor-pointer hover:underline">Atualizar Logo</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome da Imobiliária</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">CRECI Jurídico</label>
                            <input
                                type="text"
                                value={creci}
                                onChange={e => setCreci(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Telefone Central</label>
                            <input
                                type="text"
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail de Contato</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Equipe / Metas === */}
            {activeTab === 'equipe' && (
                <Card className="p-6 space-y-5">
                    <p className="text-sm text-text-muted">Configure as metas globais que a equipe deve buscar mensalmente.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Meta Mensal de Vendas (N° de contratos)
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={metaVendas}
                                onChange={e => setMetaVendas(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Meta de Visitas da Equipe
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={metaVisitas}
                                onChange={e => setMetaVisitas(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Distribuição === */}
            {activeTab === 'distribuicao' && (
                <Card className="p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-xl">
                        <div>
                            <p className="font-semibold">Roleta Automática de Leads</p>
                            <p className="text-sm text-text-muted mt-1">Ao ativar, os leads serão distribuídos automaticamente entre os corretores participantes com base em seus pesos e performance.</p>
                        </div>
                        <button
                            onClick={() => setRoletaAtiva(!roletaAtiva)}
                            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${roletaAtiva ? 'bg-brand' : 'bg-slate-200'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${roletaAtiva ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {!roletaAtiva && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm">
                            <strong>Atenção:</strong> Como a roleta está desativada, os novos leads cairão no "Saco de Leads" e precisarão ser atribuídos manualmente a um corretor ou resgatados pelos mesmos.
                        </div>
                    )}
                </Card>
            )}

            {/* === Aba Integracoes === */}
            {activeTab === 'integracoes' && (
                <Card className="p-6 space-y-5">
                    <p className="text-sm text-text-muted">Conecte a plataforma às suas ferramentas de marketing para captação direta de leads.</p>

                    <div className="grid gap-4">
                        <div className="p-4 border border-border rounded-xl flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#36c1cc] rounded-lg"></div>
                                <div>
                                    <p className="font-semibold text-sm">RD Station Marketing</p>
                                    <p className="text-xs text-text-muted">Em breve</p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-xs py-1.5" disabled>Conectar</Button>
                        </div>

                        <div className="p-4 border border-border rounded-xl flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#1877F2] rounded-lg"></div>
                                <div>
                                    <p className="font-semibold text-sm">Facebook Lead Ads</p>
                                    <p className="text-xs text-text-muted">Em breve</p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-xs py-1.5" disabled>Conectar</Button>
                        </div>

                        <div className="p-4 border border-brand/20 bg-brand/5 rounded-xl">
                            <p className="font-semibold text-sm text-brand mb-2">Webhooks Personalizados</p>
                            <p className="text-xs text-text-secondary mb-4">Tem outra fonte de dados? Recebemos seus leads via POST.</p>
                            <input 
                                type="text" 
                                readOnly 
                                value="https://api.prosperalead.com.br/v1/webhooks/imob-1" 
                                className="w-full text-xs font-mono px-3 py-2 bg-white border border-border rounded-lg text-text-muted" 
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Notificações === */}
            {activeTab === 'notificacoes' && (
                <Card className="p-6 space-y-6">
                    <p className="text-sm text-text-muted">Escolha quais alertas do time você deseja receber para se manter informado.</p>

                    <div className="space-y-0 divide-y divide-border/50 border border-border rounded-xl">
                        {[
                            { label: 'SLA Estourado (Equipe)', desc: 'Quando um corretor demorar para atender um lead', state: notifSlaEstourado, setter: setNotifSlaEstourado },
                            { label: 'Novo Lead Quente', desc: 'Notifique a gerência quando um lead de alta propensão entrar', state: notifNovoLeadQuente, setter: setNotifNovoLeadQuente },
                            { label: 'Meta Atingida', desc: 'Quando a equipe alcançar a meta de vendas mensal', state: notifMetaAtingida, setter: setNotifMetaAtingida },
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
                            Salvar modificações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

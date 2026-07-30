import { useState } from 'react';
import { Building, ShieldCheck, Link, Bell, Save, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type Tab = 'perfil' | 'regras' | 'integracoes' | 'notificacoes';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Empresa', icon: <Building size={16} /> },
    { id: 'regras', label: 'Regras de Negócio', icon: <ShieldCheck size={16} /> },
    { id: 'integracoes', label: 'Integrações', icon: <Link size={16} /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell size={16} /> },
];

export function ConfiguracoesIncorporadora() {
    const [activeTab, setActiveTab] = useState<Tab>('perfil');
    const [saved, setSaved] = useState(false);

    // Perfil
    const [nome, setNome] = useState('Prospera Properties');
    const [razaoSocial, setRazaoSocial] = useState('Prospera Empreendimentos LTDA');
    const [cnpj, setCnpj] = useState('00.000.000/0001-00');
    const [email, setEmail] = useState('contato@prosperaproperties.com.br');

    // Regras de Negocio
    const [slaPadrao, setSlaPadrao] = useState(15);
    const [exigirLeitura, setExigirLeitura] = useState(true);

    // Notificações - Email / Push
    const [notifQuedaConversao, setNotifQuedaConversao] = useState({ email: true, push: true });
    const [notifNovoCadastro, setNotifNovoCadastro] = useState({ email: true, push: false });
    const [notifRelatorioMensal, setNotifRelatorioMensal] = useState({ email: true, push: false });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Incorporadora</h1>
                <p className="text-text-secondary text-sm mt-1">Gerencie a conta central, regras da rede e chaves de integração</p>
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
                            P
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{nome}</p>
                            <p className="text-text-muted text-sm cursor-pointer hover:underline">Atualizar Logo</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome Fantasia</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Razão Social</label>
                            <input
                                type="text"
                                value={razaoSocial}
                                onChange={e => setRazaoSocial(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">CNPJ</label>
                            <input
                                type="text"
                                value={cnpj}
                                onChange={e => setCnpj(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail de Contato Principal</label>
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

            {/* === Aba Regras de Negocio === */}
            {activeTab === 'regras' && (
                <Card className="p-6 space-y-5">
                    <p className="text-sm text-text-muted">Estabeleça as regras padrões que a rede de parceiros deve cumprir.</p>

                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                SLA Padrão Exigido da Rede <span className="text-text-muted font-normal">(minutos)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={120}
                                value={slaPadrao}
                                onChange={e => setSlaPadrao(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30 text-sm"
                            />
                            <p className="text-xs text-text-muted mt-1">Imobiliárias que operarem acima desse teto farão o lead voltar para o saco geral</p>
                        </div>
                        
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border">
                            <div>
                                <p className="font-semibold text-sm">Exigir Confirmação de Leitura?</p>
                                <p className="text-xs text-text-muted mt-1">Se ativo, a Imobiliária precisa confirmar interesse no lead antes de distribui-lo.</p>
                            </div>
                            <button
                                onClick={() => setExigirLeitura(!exigirLeitura)}
                                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${exigirLeitura ? 'bg-brand' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${exigirLeitura ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Integracoes === */}
            {activeTab === 'integracoes' && (
                <Card className="p-6 space-y-5">
                    <p className="text-sm text-text-muted">Conecte sua Incorporadora aos principais agregadores e ferramentas de automação.</p>

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
                                    <p className="font-semibold text-sm">Facebook Lead Ads (Conta Matriz)</p>
                                    <p className="text-xs text-text-muted">Em breve</p>
                                </div>
                            </div>
                            <Button variant="outline" className="text-xs py-1.5" disabled>Conectar</Button>
                        </div>

                        <div className="p-4 border border-brand/20 bg-brand/5 rounded-xl">
                            <p className="font-semibold text-sm text-brand mb-2">Webhooks Personalizados</p>
                            <p className="text-xs text-text-secondary mb-4">Recebemos seus leads institucionais via requisição POST.</p>
                            <input 
                                type="text" 
                                readOnly 
                                value="https://api.prosperalead.com.br/v1/webhooks/inc-master" 
                                className="w-full text-xs font-mono px-3 py-2 bg-white border border-border rounded-lg text-text-muted cursor-copy hover:border-brand/50 transition-colors"
                                title="Clique para copiar"
                                onClick={(e) => {
                                    (e.target as HTMLInputElement).select();
                                    document.execCommand('copy');
                                }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* === Aba Notificações === */}
            {activeTab === 'notificacoes' && (
                <Card className="p-6 space-y-6">
                    <p className="text-sm text-text-muted">Escolha quais alertas institucionais deseja monitorar da operação como um todo.</p>

                    <div className="space-y-0 divide-y divide-border/50 border border-border rounded-xl">
                        {[
                            { label: 'Queda de Conversão', desc: 'Alertar se a conversão geral da rede cair mais de 5% no dia', state: notifQuedaConversao, setter: setNotifQuedaConversao },
                            { label: 'Novos Cadastros', desc: 'Quando uma Imobiliária parceira se cadastrar na master', state: notifNovoCadastro, setter: setNotifNovoCadastro },
                            { label: 'Relatórios Semanais', desc: 'Resumo das métricas principais da plataforma toda segunda-feira', state: notifRelatorioMensal, setter: setNotifRelatorioMensal },
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

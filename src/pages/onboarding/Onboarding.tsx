import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTour } from '../../context/TourContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
    Building2, Store, UserCheck, 
    ArrowRight, CheckCircle2, 
    Target, Settings, Award, 
    Image as ImageIcon
} from 'lucide-react';

export function Onboarding() {
    const { profile, setCurrentPage } = useApp();
    const { startTour } = useTour();
    const [step, setStep] = useState(1);

    // Common wizard functions
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);
    
    // Goes to dashboard directly
    const finish = () => {
        setCurrentPage('dashboard');
    };

    // Starts the interactive tour
    const startInteractiveTour = () => {
        setCurrentPage('dashboard');
        // Small delay to allow dashboard to render DOM elements
        setTimeout(() => {
            if (profile === 'incorporadora') {
                startTour('tour-inc', [
                    { targetId: 'tour-dashboard', title: 'Dashboard', content: 'Sua visão geral de métricas está aqui.', placement: 'right' },
                    { targetId: 'tour-imobiliarias', title: 'Gestão de Parceiros', content: 'Aqui você cadastra e acompanha suas imobiliárias parceiras.', placement: 'right' },
                    { targetId: 'tour-campanhas', title: 'Campanhas', content: 'Crie regras, pontuações e prêmios para os melhores corretores.', placement: 'right' },
                    { targetId: 'tour-academia', title: 'Academia Prospera', content: 'Aprenda, conclua cursos e ganhe XP e Prêmios usando o sistema!', placement: 'right' },
                ]);
            } else if (profile === 'imobiliaria') {
                startTour('tour-imo', [
                    { targetId: 'tour-distribuicao', title: 'Regras da Roleta', content: 'Gerencie como os leads são distribuídos para a sua equipe.', placement: 'right' },
                    { targetId: 'tour-corretores', title: 'Seus Corretores', content: 'Acompanhe a performance individual e convide novos agentes.', placement: 'right' },
                    { targetId: 'tour-academia', title: 'Treinamentos', content: 'Seu time pode aprender e gerar pontos aqui.', placement: 'right' }
                ]);
            } else {
                startTour('tour-cor', [
                    { targetId: 'tour-meus-leads', title: 'Seus Leads', content: 'Sua lista de trabalho. Atenda rápido para não perder na roleta!', placement: 'right' },
                    { targetId: 'tour-meus-empreendimentos', title: 'Material de Vendas', content: 'Acesse espelhos de vendas, preços e fotos aqui.', placement: 'right' },
                    { targetId: 'tour-academia', title: 'Academia', content: 'Faça os cursos de fechamento e suba de nível para ganhar mais leads.', placement: 'right' }
                ]);
            }
        }, 500);
    };

    // --- Onboarding INCORPORADORA ---
    if (profile === 'incorporadora') {
        return (
            <div className="max-w-2xl mx-auto py-8">
                {step === 1 && (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
                            <Building2 size={40} />
                        </div>
                        <h1 className="text-3xl font-bold">Bem-vindo à Prospera, Gestor!</h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                            Você está no controle da sua rede de parceiros. Aqui você terá visão total sobre a distribuição de leads, conversão de imobiliárias parceiras e performance real de corretores.
                        </p>
                        <ul className="text-sm text-left bg-black/[0.03] p-6 rounded-2xl max-w-md mx-auto space-y-4">
                            <li className="flex items-start gap-3">
                                <Target className="text-brand shrink-0 mt-0.5" size={18} />
                                <span><b>Envio inteligente:</b> Seus leads vão direto para a imobiliária correta e para a roleta do time comercial.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Settings className="text-brand shrink-0 mt-0.5" size={18} />
                                <span><b>Auditoria ativa:</b> SLA de primeiro contato acompanhado de perto com re-roteamento automático.</span>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Button onClick={nextStep} className="px-8 py-6 text-lg rounded-full">
                                Começar Configuração <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <Card className="p-8 animate-fade-in">
                        <div className="mb-8">
                            <p className="text-sm font-semibold text-brand tracking-widest uppercase mb-2">Passo 1 de 2</p>
                            <h2 className="text-2xl font-bold">Dados da Incorporadora</h2>
                            <p className="text-text-secondary mt-1">Informações básicas para personalizar seu ambiente.</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Razão Social</label>
                                <input type="text" placeholder="Sua Empresa Empreendimentos LTDA" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">CNPJ</label>
                                <input type="text" placeholder="00.000.000/0001-00" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Logotipo</label>
                                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-text-muted hover:bg-black/[0.02] cursor-pointer transition-colors">
                                    <ImageIcon size={32} className="mb-3" />
                                    <span className="text-sm font-medium text-text-primary">Clique para fazer upload</span>
                                    <span className="text-xs mt-1">PNG ou JPG até 2MB</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep}>Próximo Passo <ArrowRight className="ml-2" size={16} /></Button>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="p-8 animate-fade-in">
                        <div className="mb-8">
                            <p className="text-sm font-semibold text-brand tracking-widest uppercase mb-2">Passo 2 de 2</p>
                            <h2 className="text-2xl font-bold">Configuração da Rede</h2>
                            <p className="text-text-secondary mt-1">Defina as regras globais cobradas das imobiliárias parceiras.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <h3 className="font-semibold text-amber-800 mb-1">Qual o tempo ideal de resposta?</h3>
                                <p className="text-sm text-amber-700/80 mb-4">Leads que passam muito tempo na fila esfriam. Determine o SLA máximo aceito globalmente.</p>
                                <div className="flex items-center gap-3">
                                    <input type="number" defaultValue="15" className="w-24 px-4 py-2 rounded-lg border border-amber-300 bg-white text-center font-bold text-lg" />
                                    <span className="text-amber-800 font-medium">minutos (SLA Padrão)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep} variant="primary">Finalizar</Button>
                        </div>
                    </Card>
                )}

                {step === 4 && (
                    <div className="text-center space-y-6 py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-bold">Tudo pronto!</h2>
                        <p className="text-text-secondary text-lg mb-8">Seu painel corporativo está configurado e pronto para uso.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Button onClick={finish} variant="ghost" className="px-8 py-4 rounded-xl border border-border">
                                Pular direto para o Painel
                            </Button>
                            <Button onClick={startInteractiveTour} className="px-8 py-4 rounded-xl bg-brand font-bold">
                                Iniciar Tour Interativo <Award className="ml-2" size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Onboarding IMOBILIÁRIA ---
    if (profile === 'imobiliaria') {
        return (
            <div className="max-w-2xl mx-auto py-8">
                {step === 1 && (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto">
                            <Store size={40} />
                        </div>
                        <h1 className="text-3xl font-bold">Pronto para distribuir mais leads?</h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                            Na Prospera, sua imobiliária recebe os leads da incorporadora de forma automática e gerencia sua roleta de corretores em tempo real.
                        </p>
                        <ul className="text-sm text-left bg-black/[0.03] p-6 rounded-2xl max-w-md mx-auto space-y-4">
                            <li className="flex items-start gap-3">
                                <Target className="text-violet-600 shrink-0 mt-0.5" size={18} />
                                <span>Acompanhe o funil do seu time e identifique gargalos.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Award className="text-violet-600 shrink-0 mt-0.5" size={18} />
                                <span>Cadastre sua equipe, analise conversões e otimize resultados.</span>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Button onClick={nextStep} className="px-8 py-6 text-lg rounded-full">
                                Configurar Imobiliária <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <Card className="p-8 animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Dados da Imobiliária</h2>
                            <p className="text-text-secondary mt-1">Preencha os dados jurídicos.</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome Fantasia</label>
                                <input type="text" placeholder="Sua Empresa" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">CRECI Jurídico</label>
                                <input type="text" placeholder="J-123456" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Telefone Comercial</label>
                                <input type="tel" placeholder="(00) 0000-0000" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep}>Próximo Passo <ArrowRight className="ml-2" size={16} /></Button>
                        </div>
                    </Card>
                )}
                {step === 3 && (
                    <Card className="p-8 animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Regras Primárias</h2>
                            <p className="text-text-secondary mt-1">Parâmetros essenciais do seu negócio.</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Taxa de Conversão Esperada Média (%)</label>
                                <input type="number" defaultValue="5" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30" />
                            </div>
                            <div className="bg-black/[0.02] border border-border p-4 rounded-xl">
                                <p className="font-semibold text-sm mb-2">Comportamento da Roleta</p>
                                <p className="text-xs text-text-muted mb-4">Quando um corretor estourar o SLA imposto pela incorporadora, o lead deve pular imediamente para o próximo?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="skip" defaultChecked className="text-brand focus:ring-brand" /> 
                                        <span className="text-sm font-medium text-text-primary">Sim, repassar</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="skip" className="text-brand focus:ring-brand" /> 
                                        <span className="text-sm font-medium text-text-primary">Não</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep} variant="primary">Finalizar</Button>
                        </div>
                    </Card>
                )}
                {step === 4 && (
                    <div className="text-center space-y-6 py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-bold">Pronto para distribuir!</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Button onClick={finish} variant="ghost" className="px-8 py-4 rounded-xl border border-border">
                                Pular direto para o Painel
                            </Button>
                            <Button onClick={startInteractiveTour} className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">
                                Iniciar Tour Interativo <Award className="ml-2" size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Onboarding CORRETOR ---
    if (profile === 'corretor') {
        return (
            <div className="max-w-2xl mx-auto py-8">
                {step === 1 && (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <UserCheck size={40} />
                        </div>
                        <h1 className="text-3xl font-bold">Sua máquina de vendas</h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                            Receba leads quentes, atenda no prazo e suba no ranking. O sistema Prospera garante que os melhores corretores recebam as melhores oportunidades.
                        </p>
                        <ul className="text-sm text-left bg-black/[0.03] p-6 rounded-2xl max-w-md mx-auto space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                                <span>A chave para o sucesso é o <b>SLA</b>: responda leads assim que chegarem para não perdê-los para a roleta.</span>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Button onClick={nextStep} className="px-8 py-6 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                Meu Perfil <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <Card className="p-8 animate-fade-in border-emerald-500/20">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Meus Dados</h2>
                            <p className="text-text-secondary mt-1">Como você será visto no painel da imobiliária.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome Completo</label>
                                <input type="text" placeholder="Seu Nome" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">WhatsApp</label>
                                    <input type="tel" placeholder="(00) 00000-0000" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">CRECI</label>
                                    <input type="text" placeholder="12345-F" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">Próximo <ArrowRight className="ml-2" size={16} /></Button>
                        </div>
                    </Card>
                )}
                {step === 3 && (
                    <Card className="p-8 animate-fade-in border-emerald-500/20">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Meu Plano Comercial</h2>
                            <p className="text-text-secondary mt-1">Defina sua bússola para este mês.</p>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Meta Pessoal de Vendas (Neste Mês)</label>
                                <input type="number" defaultValue="4" className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xl font-bold text-brand" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-border">
                            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                            <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Metas</Button>
                        </div>
                    </Card>
                )}
                {step === 4 && (
                    <div className="text-center space-y-6 py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-bold">Mãos à obra!</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Button onClick={finish} variant="ghost" className="px-8 py-4 rounded-xl border border-border">
                                Pular
                            </Button>
                            <Button onClick={startInteractiveTour} className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                Iniciar Tour na Ferramenta <Award className="ml-2" size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

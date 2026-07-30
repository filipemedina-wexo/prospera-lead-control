import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2, Building2, MapPin, List, FileText } from 'lucide-react';

type Step = 'basico' | 'localizacao' | 'ficha' | 'midia';

export function NovoEmpreendimento() {
    const { setCurrentPage } = useApp();
    const [step, setStep] = useState<Step>('basico');

    const handleSave = () => {
        // Enviar os dados para API (Mockado)
        alert('Empreendimento salvo e publicado com sucesso no Hub de Vendas!');
        setCurrentPage('empreendimentos');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
            {/* Nav Back */}
            <button 
                onClick={() => setCurrentPage('empreendimentos')}
                className="flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors group cursor-pointer"
            >
                <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar para Gestão de Empreendimentos
            </button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Empreendimento</h1>
                <p className="text-text-secondary mt-1">Cadastre o seu produto e disponibilize material para toda a sua rede de vendas.</p>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-2 mb-8">
                {['basico', 'localizacao', 'ficha', 'midia'].map((s, index) => (
                    <div key={s} className="flex flex-col gap-2">
                        <div className={`h-2 rounded-full transition-colors ${
                            s === step ? 'bg-brand' : 
                            (index < ['basico', 'localizacao', 'ficha', 'midia'].indexOf(step)) ? 'bg-brand/40' : 'bg-black/5'
                        }`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                            s === step ? 'text-brand' : 'text-text-muted'
                        }`}>
                            {s === 'basico' ? 'Básico' : s === 'localizacao' ? 'Localização' : s === 'ficha' ? 'Ficha Técnica' : 'Mídia e Material'}
                        </span>
                    </div>
                ))}
            </div>

            <Card className="p-6 md:p-8">
                {/* STEP 1: Básico */}
                {step === 'basico' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                <Building2 size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Informações Básicas</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Empreendimento *</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand" placeholder="Ex: Residencial Aurora" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status da Obra *</label>
                                <select className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand">
                                    <option value="lancamento">Lançamento</option>
                                    <option value="em_obras">Em Obras</option>
                                    <option value="pronto">Pronto para Morar</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Regra de Comissionamento *</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand" placeholder="Ex: 5% + R$ 1.000 Bônus" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Entrega Prevista</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand" placeholder="Ex: Mar/2026" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep('localizacao')}>Próximo Passo</Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Localização */}
                {step === 'localizacao' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                <MapPin size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Localização</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Endereço Completo</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" placeholder="Rua..., Número..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bairro</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cidade/UF</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" placeholder="Ex: São Paulo, SP" />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep('basico')}>Voltar</Button>
                            <Button onClick={() => setStep('ficha')}>Próximo Passo</Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Ficha Técnica */}
                {step === 'ficha' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                <List size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Ficha Técnica</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Total de Unidades</label>
                                <input type="number" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Torres</label>
                                <input type="number" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vagas</label>
                                <input type="text" className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" />
                            </div>
                            
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-sm font-medium">Diferenciais (Separados por vírgula)</label>
                                <textarea rows={3} className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none" placeholder="Ex: Piscina Aquecida, Coworking, Pet Place" />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep('localizacao')}>Voltar</Button>
                            <Button onClick={() => setStep('midia')}>Próximo Passo</Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Mídia & Documentos */}
                {step === 'midia' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Material de Repasse</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand/40 transition-colors cursor-pointer bg-black/[0.02]">
                                <FileText className="mx-auto text-text-muted mb-2" size={32} />
                                <p className="font-semibold text-text-secondary">Arraste os arquivos aqui</p>
                                <p className="text-xs text-text-muted mt-1">Book de Vendas, Tabelas Mensais, Imagens (PDF, JPG, MP4)</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Textos de Disparo (Copys de WhatsApp)</label>
                                <textarea rows={4} className="w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand" placeholder="Escreva os melhores textos para ajudar a frente de vendas abordar os clientes." />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 mt-8 border-t border-border">
                            <Button variant="outline" onClick={() => setStep('ficha')}>Voltar</Button>
                            <Button onClick={handleSave} className="gap-2">
                                <CheckCircle2 size={18} /> Publicar no Hub de Vendas
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

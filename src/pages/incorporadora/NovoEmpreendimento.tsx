import { useState, type ReactNode } from 'react';
import { ArrowLeft, Building2, CheckCircle2, FileText, List, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

type Step = 'basico' | 'localizacao' | 'ficha' | 'midia';
type FormState = {
  nome: string; statusObra: string; regraComissionamento: string; entregaPrevista: string;
  endereco: string; bairro: string; cidade: string; uf: string; totalUnidades: string;
  torres: string; vagas: string; diferenciais: string; copyWhatsapp: string; materialUrl: string;
};

const steps: { id: Step; label: string }[] = [
  { id: 'basico', label: 'Basico' }, { id: 'localizacao', label: 'Localizacao' },
  { id: 'ficha', label: 'Ficha tecnica' }, { id: 'midia', label: 'Midia e material' },
];

export function NovoEmpreendimento() {
  const { setCurrentPage } = useApp();
  const [step, setStep] = useState<Step>('basico');
  const [form, setForm] = useState<FormState>({
    nome: '', statusObra: 'lancamento', regraComissionamento: '', entregaPrevista: '',
    endereco: '', bairro: '', cidade: '', uf: '', totalUnidades: '', torres: '',
    vagas: '', diferenciais: '', copyWhatsapp: '', materialUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const stepIndex = steps.findIndex((item) => item.id === step);

  const publish = async () => {
    if (!form.nome.trim()) { setStep('basico'); setError('Informe o nome do empreendimento.'); return; }
    setSaving(true); setError(null);
    const { error: rpcError } = await supabase.rpc('criar_empreendimento_operacional', {
      p_nome: form.nome, p_cidade: form.cidade, p_status_obra: form.statusObra,
      p_entrega_prevista: form.entregaPrevista, p_endereco: form.endereco, p_bairro: form.bairro,
      p_uf: form.uf, p_regra_comissionamento: form.regraComissionamento,
      p_total_unidades: form.totalUnidades ? Number(form.totalUnidades) : null,
      p_torres: form.torres ? Number(form.torres) : null, p_vagas: form.vagas,
      p_diferenciais: form.diferenciais.split(',').map((item) => item.trim()).filter(Boolean),
      p_copy_whatsapp: form.copyWhatsapp, p_material_url: form.materialUrl,
    });
    setSaving(false);
    if (rpcError) { setError(rpcError.message); return; }
    setCurrentPage('empreendimentos');
  };

  const inputClass = 'w-full bg-black/5 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand';
  return <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
    <button onClick={() => setCurrentPage('empreendimentos')} className="flex items-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors group cursor-pointer">
      <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" /> Voltar para Gestao de Empreendimentos
    </button>
    <div><h1 className="text-3xl font-bold tracking-tight">Novo Empreendimento</h1><p className="text-text-secondary mt-1">Cadastre o produto e disponibilize as informacoes comerciais para sua rede de vendas.</p></div>
    <div className="grid grid-cols-4 gap-2 mb-8">{steps.map((item, index) => <div key={item.id} className="flex flex-col gap-2"><div className={`h-2 rounded-full transition-colors ${item.id === step ? 'bg-brand' : index < stepIndex ? 'bg-brand/40' : 'bg-black/5'}`} /><span className={`text-[10px] font-bold uppercase tracking-wider text-center ${item.id === step ? 'text-brand' : 'text-text-muted'}`}>{item.label}</span></div>)}</div>
    <Card className="p-6 md:p-8">
      {step === 'basico' && <div className="space-y-6 animate-fade-in"><Section icon={<Building2 size={24} />} title="Informacoes basicas" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nome do empreendimento *"><input required value={form.nome} onChange={(event) => update('nome', event.target.value)} className={inputClass} placeholder="Ex: Residencial Aurora" /></Field>
        <Field label="Status da obra *"><select value={form.statusObra} onChange={(event) => update('statusObra', event.target.value)} className={inputClass}><option value="lancamento">Lancamento</option><option value="em_obras">Em obras</option><option value="pronto">Pronto para morar</option></select></Field>
        <Field label="Regra de comissionamento"><input value={form.regraComissionamento} onChange={(event) => update('regraComissionamento', event.target.value)} className={inputClass} placeholder="Ex: 5% + R$ 1.000 bonus" /></Field>
        <Field label="Entrega prevista"><input value={form.entregaPrevista} onChange={(event) => update('entregaPrevista', event.target.value)} className={inputClass} placeholder="Ex: Mar/2027" /></Field>
      </div><Actions next={() => setStep('localizacao')} /></div>}
      {step === 'localizacao' && <div className="space-y-6 animate-fade-in"><Section icon={<MapPin size={24} />} title="Localizacao" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Endereco completo" wide><input value={form.endereco} onChange={(event) => update('endereco', event.target.value)} className={inputClass} placeholder="Rua, numero, complemento" /></Field>
        <Field label="Bairro"><input value={form.bairro} onChange={(event) => update('bairro', event.target.value)} className={inputClass} /></Field>
        <Field label="Cidade"><input value={form.cidade} onChange={(event) => update('cidade', event.target.value)} className={inputClass} placeholder="Ex: Sao Paulo" /></Field>
        <Field label="UF"><input value={form.uf} onChange={(event) => update('uf', event.target.value)} maxLength={2} className={inputClass} placeholder="SP" /></Field>
      </div><Actions back={() => setStep('basico')} next={() => setStep('ficha')} /></div>}
      {step === 'ficha' && <div className="space-y-6 animate-fade-in"><Section icon={<List size={24} />} title="Ficha tecnica" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Total de unidades"><input min="0" value={form.totalUnidades} onChange={(event) => update('totalUnidades', event.target.value)} type="number" className={inputClass} /></Field>
        <Field label="Torres"><input min="0" value={form.torres} onChange={(event) => update('torres', event.target.value)} type="number" className={inputClass} /></Field>
        <Field label="Vagas"><input value={form.vagas} onChange={(event) => update('vagas', event.target.value)} className={inputClass} /></Field>
        <Field label="Diferenciais (separe por virgula)" wide><textarea value={form.diferenciais} onChange={(event) => update('diferenciais', event.target.value)} rows={3} className={inputClass} placeholder="Ex: Piscina aquecida, coworking, pet place" /></Field>
      </div><Actions back={() => setStep('localizacao')} next={() => setStep('midia')} /></div>}
      {step === 'midia' && <div className="space-y-6 animate-fade-in"><Section icon={<FileText size={24} />} title="Material de repasse" /><div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-black/[0.02]"><FileText className="mx-auto text-text-muted mb-2" size={32} /><p className="font-semibold text-text-secondary">Material por link</p><p className="text-xs text-text-muted mt-1">Cole o link publico do book, tabela ou pasta de materiais.</p></div>
        <input value={form.materialUrl} onChange={(event) => update('materialUrl', event.target.value)} type="url" className={inputClass} placeholder="https://..." />
        <Field label="Textos de disparo (WhatsApp)"><textarea value={form.copyWhatsapp} onChange={(event) => update('copyWhatsapp', event.target.value)} rows={4} className={inputClass} placeholder="Escreva os textos que ajudam a frente comercial na abordagem." /></Field>
      </div><div className="flex justify-between pt-4 mt-8 border-t border-border"><Button variant="outline" onClick={() => setStep('ficha')}>Voltar</Button><Button disabled={saving} onClick={() => void publish()} className="gap-2"><CheckCircle2 size={18} />{saving ? 'Publicando...' : 'Publicar no Hub de Vendas'}</Button></div>{error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}</div>}
    </Card>
  </div>;
}

function Section({ icon, title }: { icon: ReactNode; title: string }) { return <div className="flex items-center gap-3 border-b border-border pb-4"><div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">{icon}</div><h2 className="text-xl font-bold">{title}</h2></div>; }
function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) { return <div className={`space-y-2 ${wide ? 'md:col-span-full' : ''}`}><label className="text-sm font-medium">{label}</label>{children}</div>; }
function Actions({ back, next }: { back?: () => void; next: () => void }) { return <div className={`flex ${back ? 'justify-between' : 'justify-end'} pt-4`}>{back && <Button variant="outline" onClick={back}>Voltar</Button>}<Button onClick={next}>Proximo passo</Button></div>; }

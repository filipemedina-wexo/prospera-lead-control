import { Check, Copy, Link2, Plus, Radio, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

type Empreendimento = { id: string; nome: string };
type Integracao = { id: string; empreendimento_id: string; empreendimento_nome: string; nome: string; provedor: string; chave_publica: string; ativo: boolean; criado_em: string };
type NovaIntegracao = { chave_publica: string; segredo: string };

const providerLabels: Record<string, string> = { zapier: 'Zapier', n8n: 'n8n', meta: 'Meta Lead Ads', landing_page: 'Landing page', outro: 'Outro' };

export function ConfiguracaoCaptacao() {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomeEmpreendimento, setNomeEmpreendimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [nomeIntegracao, setNomeIntegracao] = useState('');
  const [empreendimentoId, setEmpreendimentoId] = useState('');
  const [provedor, setProvedor] = useState('n8n');
  const [creating, setCreating] = useState(false);
  const [novaIntegracao, setNovaIntegracao] = useState<NovaIntegracao | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const endpoint = (key: string) => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-ingest/${key}`;
  const load = async () => {
    setLoading(true);
    const [{ data: empData, error: empError }, { data: integrationData, error: integrationError }] = await Promise.all([
      supabase.from('empreendimentos').select('id, nome').order('nome'),
      supabase.rpc('listar_integracoes_captacao'),
    ]);
    if (empError || integrationError) setError(empError?.message || integrationError?.message || 'Não foi possível carregar a configuração.');
    else {
      const nextEmpreendimentos = (empData || []) as Empreendimento[];
      setEmpreendimentos(nextEmpreendimentos);
      setIntegracoes((integrationData || []) as Integracao[]);
      setEmpreendimentoId((current) => current || nextEmpreendimentos[0]?.id || '');
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const createEmpreendimento = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreating(true);
    const { data, error: rpcError } = await supabase.rpc('criar_empreendimento_operacional', { p_nome: nomeEmpreendimento, p_cidade: cidade || null });
    if (rpcError) setError(rpcError.message);
    else { setNomeEmpreendimento(''); setCidade(''); await load(); setEmpreendimentoId(data as string); }
    setCreating(false);
  };

  const createIntegracao = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreating(true);
    const { data, error: rpcError } = await supabase.rpc('criar_integracao_captacao', { p_empreendimento_id: empreendimentoId, p_nome: nomeIntegracao, p_provedor: provedor });
    if (rpcError) setError(rpcError.message);
    else {
      const created = Array.isArray(data) ? data[0] : data;
      setNovaIntegracao(created as NovaIntegracao);
      setNomeIntegracao('');
      await load();
    }
    setCreating(false);
  };

  return <div className="cockpit-shell max-w-[1120px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
    <section><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Captação</p><h1 className="text-[28px] font-extrabold tracking-[-.04em]">Webhook de leads</h1><p className="text-sm text-text-secondary mt-2">Crie uma integração por empreendimento e conecte seu Zapier, n8n ou formulário. O segredo não fica salvo no navegador.</p></section>
    {error && <Card className="p-4 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}
    {novaIntegracao && <Card className="p-5 border-emerald-200 bg-emerald-50"><div className="flex gap-3"><ShieldCheck className="text-emerald-600 shrink-0" /><div className="min-w-0 flex-1"><h2 className="font-bold">Integração criada. Copie o segredo agora.</h2><p className="text-sm text-text-secondary mt-1">Por segurança, ele não poderá ser exibido novamente.</p><SecretField label="URL do webhook" value={endpoint(novaIntegracao.chave_publica)} copied={copied === 'url'} onCopy={() => void copy(endpoint(novaIntegracao.chave_publica), 'url')} /><SecretField label="Segredo (header x-prospera-secret)" value={novaIntegracao.segredo} copied={copied === 'secret'} onCopy={() => void copy(novaIntegracao.segredo, 'secret')} /><button onClick={() => setNovaIntegracao(null)} className="mt-4 text-xs font-bold text-emerald-700 hover:underline">Já copiei, fechar aviso</button></div></div></Card>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-5"><div className="flex items-center gap-2"><Plus size={18} className="text-[#7869c9]" /><h2 className="font-bold">1. Cadastre o empreendimento</h2></div><p className="text-sm text-text-secondary mt-1 mb-5">O webhook sempre pertence a um empreendimento.</p><form onSubmit={createEmpreendimento} className="space-y-3"><input required value={nomeEmpreendimento} onChange={(event) => setNomeEmpreendimento(event.target.value)} placeholder="Nome do empreendimento" className="w-full h-10 px-3 rounded-lg border border-border bg-bg text-sm" /><input value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade (opcional)" className="w-full h-10 px-3 rounded-lg border border-border bg-bg text-sm" /><button disabled={creating} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold disabled:opacity-50">Cadastrar empreendimento</button></form></Card>
      <Card className="p-5"><div className="flex items-center gap-2"><Radio size={18} className="text-[#7869c9]" /><h2 className="font-bold">2. Gere o webhook</h2></div><p className="text-sm text-text-secondary mt-1 mb-5">A URL identifica a integração; o segredo autentica cada envio.</p><form onSubmit={createIntegracao} className="space-y-3"><select required value={empreendimentoId} onChange={(event) => setEmpreendimentoId(event.target.value)} disabled={!empreendimentos.length} className="w-full h-10 px-3 rounded-lg border border-border bg-bg text-sm"><option value="">Selecione o empreendimento</option>{empreendimentos.map((emp) => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}</select><input required value={nomeIntegracao} onChange={(event) => setNomeIntegracao(event.target.value)} placeholder="Ex.: Meta Ads principal" className="w-full h-10 px-3 rounded-lg border border-border bg-bg text-sm" /><select value={provedor} onChange={(event) => setProvedor(event.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-bg text-sm">{Object.entries(providerLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button disabled={creating || !empreendimentoId} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold disabled:opacity-50">Gerar integração</button></form></Card>
    </div>
    <Card className="p-5"><div className="flex items-center gap-2"><Link2 size={18} className="text-[#7869c9]" /><div><h2 className="font-bold">Como configurar no Zapier ou n8n</h2><p className="text-sm text-text-secondary mt-1">Faça uma requisição <strong>POST</strong>, com header <code>x-prospera-secret</code> e corpo JSON contendo <code>nome</code>, <code>telefone</code> e, opcionalmente, <code>email</code> e <code>id</code>.</p></div></div><pre className="mt-4 p-4 rounded-lg bg-[#242129] text-white/90 text-xs overflow-x-auto">{`{\n  "nome": "Maria Silva",\n  "telefone": "11999999999",\n  "email": "maria@email.com",\n  "id": "lead-do-origem"\n}`}</pre></Card>
    <Card className="p-5"><h2 className="font-bold">Integrações ativas</h2>{loading ? <p className="text-sm text-text-secondary mt-4">Carregando...</p> : integracoes.length === 0 ? <p className="text-sm text-text-secondary mt-4">Nenhuma integração criada ainda.</p> : <div className="mt-4 divide-y divide-border">{integracoes.map((item) => <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><p className="text-sm font-semibold">{item.nome}</p><p className="text-xs text-text-secondary">{item.empreendimento_nome} · {providerLabels[item.provedor] || item.provedor}</p></div><button onClick={() => void copy(endpoint(item.chave_publica), item.id)} className="text-xs font-bold text-[#5c4eaa] flex items-center gap-1">{copied === item.id ? <Check size={14} /> : <Copy size={14} />} Copiar URL</button></div>)}</div>}</Card>
  </div>;
}

function SecretField({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return <div className="mt-4"><p className="text-xs font-bold text-text-secondary mb-1.5">{label}</p><div className="flex gap-2"><code className="flex-1 min-w-0 break-all rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs">{value}</code><button onClick={onCopy} className="shrink-0 w-10 rounded-lg border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center" aria-label={`Copiar ${label}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div></div>;
}

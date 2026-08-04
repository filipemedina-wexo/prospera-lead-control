import { Building2, MapPin, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

type Empreendimento = { id: string; nome: string; cidade: string | null; status_obra: 'lancamento' | 'em_obras' | 'pronto' | null; criado_em: string };
const statusLabel = { lancamento: 'Lançamento', em_obras: 'Em obras', pronto: 'Pronto' };

export function GestaoEmpreendimentos() {
  const [items, setItems] = useState<Empreendimento[]>([]);
  const [search, setSearch] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase.from('empreendimentos').select('id, nome, cidade, status_obra, criado_em').order('criado_em', { ascending: false });
    if (queryError) setError(queryError.message); else setItems((data || []) as Empreendimento[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const visible = useMemo(() => items.filter((item) => `${item.nome} ${item.cidade || ''}`.toLowerCase().includes(search.trim().toLowerCase())), [items, search]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setSaving(true);
    const { error: rpcError } = await supabase.rpc('criar_empreendimento_operacional', { p_nome: nome, p_cidade: cidade || null });
    if (rpcError) setError(rpcError.message); else { setNome(''); setCidade(''); await load(); }
    setSaving(false);
  };

  return <div className="cockpit-shell max-w-[1120px] mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
    <section><p className="mono text-[10px] uppercase tracking-[.2em] text-[#7869c9] mb-2">Produtos</p><h1 className="text-[28px] font-extrabold tracking-[-.04em]">Empreendimentos</h1><p className="text-sm text-text-secondary mt-2">Cadastre os produtos que podem receber leads e ter distribuição configurada.</p></section>
    <Card className="p-5"><div className="flex items-center gap-2 mb-4"><Plus size={18} className="text-[#7869c9]" /><h2 className="font-bold">Novo empreendimento</h2></div><form onSubmit={submit} className="flex flex-col sm:flex-row gap-3"><input required value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Nome do empreendimento" className="h-10 flex-1 px-3 rounded-lg border border-border bg-bg text-sm" /><input value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade (opcional)" className="h-10 sm:w-56 px-3 rounded-lg border border-border bg-bg text-sm" /><button disabled={saving} className="h-10 px-4 rounded-lg bg-[#7869c9] text-white text-xs font-bold disabled:opacity-50">Cadastrar</button></form>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</Card>
    <Card className="p-0 overflow-hidden"><div className="p-4 border-b border-border"><div className="relative max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empreendimento" className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-bg text-sm" /></div></div>{loading ? <p className="p-6 text-sm text-text-secondary">Carregando...</p> : visible.length === 0 ? <div className="p-12 text-center"><Building2 className="mx-auto text-text-muted opacity-30" size={40} /><p className="mt-3 font-semibold">Nenhum empreendimento cadastrado.</p><p className="text-sm text-text-secondary mt-1">Comece pelo cadastro acima.</p></div> : <div className="divide-y divide-border">{visible.map((item) => <div key={item.id} className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center"><Building2 size={20} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.nome}</p><p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">{item.cidade ? <><MapPin size={12} />{item.cidade}</> : 'Cidade não informada'}</p></div><span className="text-xs font-medium px-2 py-1 rounded-md bg-brand/10 text-brand">{item.status_obra ? statusLabel[item.status_obra] : 'Sem status'}</span></div>)}</div>}</Card>
  </div>;
}

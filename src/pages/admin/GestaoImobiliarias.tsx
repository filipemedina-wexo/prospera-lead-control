import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { LoaderCircle, Search, ShieldAlert, Store } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

type Agency = {
  id: string;
  nome: string;
  cidade: string | null;
  ativo: boolean;
  incorporadoras: Array<{ nome: string }>;
  corretores: Array<{ id: string; ativo: boolean }>;
};
type Owner = { id: string; nome: string };

export function GestaoImobiliarias() {
  const [items, setItems] = useState<Agency[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', incorporadora_id: '', cidade: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [agencies, incorporadoras] = await Promise.all([
      supabase.from('imobiliarias').select('id,nome,cidade,ativo,incorporadoras(nome),corretores(id,ativo)').order('nome'),
      supabase.from('incorporadoras').select('id,nome').order('nome'),
    ]);
    if (agencies.error) setError(agencies.error.message);
    else setItems((agencies.data || []) as Agency[]);
    if (incorporadoras.error) setError(incorporadoras.error.message);
    else setOwners((incorporadoras.data || []) as Owner[]);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const filtered = useMemo(() => items.filter(item => `${item.nome} ${item.cidade || ''} ${item.incorporadoras?.[0]?.nome || ''}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!form.nome.trim() || !form.incorporadora_id) return;
    setSaving(true); setError(null);
    const { error: createError } = await supabase.rpc('criar_imobiliaria_operacao', {
      p_nome: form.nome, p_incorporadora_id: form.incorporadora_id, p_cidade: form.cidade || null,
    });
    if (createError) setError(createError.message);
    else { setForm({ nome: '', incorporadora_id: '', cidade: '' }); await load(); }
    setSaving(false);
  }

  async function toggle(item: Agency) {
    setError(null);
    const { error: updateError } = await supabase.from('imobiliarias').update({ ativo: !item.ativo }).eq('id', item.id);
    if (updateError) setError(updateError.message); else await load();
  }

  return <div className="space-y-6 animate-fade-in pb-12">
    <div><h1 className="text-3xl font-bold tracking-tight">Diretório: Imobiliárias</h1><p className="text-text-secondary mt-1">Parceiros reais da operação, vinculados à incorporadora e prontos para receber acessos.</p></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2"><form onSubmit={create} className="grid gap-3 md:grid-cols-3"><input required className="input" placeholder="Nome da imobiliária" value={form.nome} onChange={event => setForm(current => ({ ...current, nome: event.target.value }))} /><select required className="input" value={form.incorporadora_id} onChange={event => setForm(current => ({ ...current, incorporadora_id: event.target.value }))}><option value="">Incorporadora proprietária</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.nome}</option>)}</select><input className="input" placeholder="Cidade (opcional)" value={form.cidade} onChange={event => setForm(current => ({ ...current, cidade: event.target.value }))} /><div className="md:col-span-3"><Button type="submit" disabled={saving || !owners.length}>{saving ? 'Cadastrando…' : 'Cadastrar imobiliária e operação'}</Button></div></form></Card>
      <Card className="p-5 text-sm text-text-secondary">O cadastro cria também a organização operacional da imobiliária. Depois, use “Organizações e acessos” para convidar gestores e corretores.</Card>
    </div>
    <Card className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} /><input type="search" placeholder="Buscar por imobiliária, cidade ou incorporadora..." value={search} onChange={event => setSearch(event.target.value)} className="w-full bg-black/5 border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand/50" /></div></Card>
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden min-h-[240px]"><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-black/5 border-b border-border text-sm"><th className="px-6 py-4 font-semibold text-text-secondary">Imobiliária</th><th className="px-6 py-4 font-semibold text-text-secondary">Incorporadora</th><th className="px-6 py-4 font-semibold text-text-secondary">Corretores ativos</th><th className="px-6 py-4 font-semibold text-text-secondary">Status</th><th className="px-6 py-4 text-right">Ação</th></tr></thead><tbody className="divide-y divide-border">{loading ? <tr><td colSpan={5} className="py-10 text-center"><LoaderCircle className="inline animate-spin text-text-muted" /></td></tr> : filtered.length ? filtered.map(item => <tr key={item.id} className="hover:bg-black/5"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><Store size={16} className="text-indigo-500" /></div><div><p className="font-semibold">{item.nome}</p>{item.cidade && <p className="text-xs text-text-muted">{item.cidade}</p>}</div></div></td><td className="px-6 py-4 text-sm text-text-secondary">{item.incorporadoras?.[0]?.nome || 'Sem vínculo'}</td><td className="px-6 py-4 text-sm font-semibold">{item.corretores.filter(broker => broker.ativo).length}</td><td className="px-6 py-4">{item.ativo ? <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">Ativa</span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600"><ShieldAlert size={12} />Bloqueada</span>}</td><td className="px-6 py-4 text-right"><Button variant="ghost" onClick={() => void toggle(item)}>{item.ativo ? 'Bloquear' : 'Reativar'}</Button></td></tr>) : <tr><td colSpan={5} className="py-10 text-center text-sm text-text-muted">Nenhuma imobiliária encontrada.</td></tr>}</tbody></table></div></div>
  </div>;
}

import { useEffect, useState, type FormEvent } from 'react';
import { Building2, LoaderCircle, MailPlus, Plus, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type Tipo = 'incorporadora' | 'gestora_lancamentos' | 'imobiliaria';
type Organizacao = { id: string; nome: string; tipo: Tipo; organizacao_membros: Array<{ ativo: boolean }> };
const labels: Record<Tipo, string> = { incorporadora: 'Incorporadora', gestora_lancamentos: 'Gestora de Lançamentos', imobiliaria: 'Imobiliária' };

export function GestaoIncorporadoras() {
  const [items, setItems] = useState<Organizacao[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState(''); const [tipo, setTipo] = useState<Tipo>('incorporadora');
  const [invite, setInvite] = useState({ email: '', organizacao_id: '', papel: 'admin' }); const [sending, setSending] = useState(false);
  async function load() {
    setLoading(true);
    const { data, error: queryError } = await supabase.from('organizacoes').select('id,nome,tipo,organizacao_membros(ativo)').order('nome');
    if (queryError) setError(queryError.message);
    else { setItems((data || []) as Organizacao[]); setInvite(current => ({ ...current, organizacao_id: current.organizacao_id || data?.[0]?.id || '' })); }
    setLoading(false);
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  async function create(event: FormEvent) {
    event.preventDefault(); setError(null); const clean = nome.trim(); if (!clean) return;
    const { error: createError } = await supabase.from('organizacoes').insert({ nome: clean, tipo });
    if (createError) setError(createError.message); else { setNome(''); await load(); }
  }
  async function sendInvite(event: FormEvent) {
    event.preventDefault(); setSending(true); setError(null);
    const { error: invokeError } = await supabase.functions.invoke('operation-invite', { body: { ...invite, redirect_to: `${window.location.origin}/#/aceitar-convite` } });
    if (invokeError) setError(invokeError.message); else setInvite(current => ({ ...current, email: '' })); setSending(false);
  }
  return <div className="space-y-6 pb-12">
    <div><h1 className="text-2xl font-bold">Organizações e acessos</h1><p className="text-sm text-text-secondary mt-1">Dados reais da operação multi-organização. Convites são enviados pelo servidor.</p></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold flex gap-2 items-center"><Building2 size={17} />Organizações</h2><span className="text-xs text-text-muted">{items.length} cadastrada(s)</span></div>
        {loading ? <div className="py-10 flex justify-center"><LoaderCircle className="animate-spin text-text-muted" /></div> : <div className="divide-y divide-border">{items.map(item => <div key={item.id} className="flex items-center gap-3 py-3"><div className="rounded-lg bg-brand/10 p-2 text-brand"><Building2 size={16} /></div><div className="flex-1"><p className="font-medium text-sm">{item.nome}</p><p className="text-xs text-text-muted">{labels[item.tipo]} · {item.organizacao_membros.filter(member => member.ativo).length} acesso(s) ativo(s)</p></div></div>)}{!items.length && <p className="py-8 text-center text-sm text-text-muted">Nenhuma organização cadastrada.</p>}</div>}
      </Card>
      <Card className="p-5"><h2 className="font-semibold flex gap-2 items-center mb-4"><Plus size={17} />Nova organização</h2><form onSubmit={create} className="space-y-3"><input className="input w-full" value={nome} onChange={event => setNome(event.target.value)} placeholder="Nome da organização" /><select className="input w-full" value={tipo} onChange={event => setTipo(event.target.value as Tipo)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button className="w-full" type="submit">Cadastrar</Button></form></Card>
    </div>
    <Card className="p-5"><div className="mb-4"><h2 className="font-semibold flex gap-2 items-center"><MailPlus size={17} />Convidar usuário</h2><p className="text-xs text-text-muted mt-1">O convite vincula o usuário à organização antes do primeiro acesso.</p></div><form onSubmit={sendInvite} className="grid gap-3 md:grid-cols-4"><input required type="email" className="input" placeholder="email@empresa.com" value={invite.email} onChange={event => setInvite(current => ({ ...current, email: event.target.value }))} /><select className="input" value={invite.organizacao_id} onChange={event => setInvite(current => ({ ...current, organizacao_id: event.target.value }))}>{items.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><select className="input" value={invite.papel} onChange={event => setInvite(current => ({ ...current, papel: event.target.value }))}><option value="admin">Administrador</option><option value="gestor">Gestor</option><option value="corretor">Corretor</option></select><Button disabled={sending || !invite.organizacao_id} type="submit" className="gap-2"><Users size={16} />{sending ? 'Enviando…' : 'Enviar convite'}</Button></form></Card>
  </div>;
}

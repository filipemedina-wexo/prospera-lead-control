import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Building2, Eye, LoaderCircle, MailPlus, Plus, Search, Shield, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth, type Profile } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { UserProfile } from '../../data/mockData';

type Tipo = 'incorporadora' | 'gestora_lancamentos' | 'imobiliaria';
type Organizacao = { id: string; nome: string; tipo: Tipo; organizacao_membros: Array<{ ativo: boolean }> };
type Incorporadora = { id: string; nome: string };
const labels: Record<Tipo, string> = { incorporadora: 'Incorporadora', gestora_lancamentos: 'Gestora de Lançamentos', imobiliaria: 'Imobiliária' };
const roleLabels: Record<Profile['role'], string> = { incorporadora: 'Incorporadora', gestora_lancamentos: 'Gestora de Lançamentos', imobiliaria: 'Imobiliária', corretor: 'Corretor' };

export function GestaoIncorporadoras() {
  const [items, setItems] = useState<Organizacao[]>([]);
  const [incorporadoras, setIncorporadoras] = useState<Incorporadora[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState(''); const [tipo, setTipo] = useState<Tipo>('incorporadora');
  const [invite, setInvite] = useState({ email: '', organizacao_id: '', papel: 'admin' }); const [sending, setSending] = useState(false);
  const [profileFilter, setProfileFilter] = useState(''); const [assumingId, setAssumingId] = useState<string | null>(null);
  const { actualProfile, startOperatingAs, startOperatingOrganization } = useAuth();
  const { setProfile } = useApp();

  async function load() {
    setLoading(true);
    const [{ data, error: organizationsError }, { data: profilesData, error: profilesError }, { data: incorporadorasData, error: incorporadorasError }] = await Promise.all([
      supabase.from('organizacoes').select('id,nome,tipo,organizacao_membros(ativo)').order('nome'),
      supabase.from('profiles').select('id, incorporadora_id, gestora_id, imobiliaria_id, corretor_id, role, is_superadmin, nome, email').order('nome'),
      supabase.from('incorporadoras').select('id,nome').order('nome'),
    ]);
    if (organizationsError) setError(organizationsError.message);
    else { setItems((data || []) as Organizacao[]); setInvite(current => ({ ...current, organizacao_id: current.organizacao_id || data?.[0]?.id || '' })); }
    if (profilesError) setError(profilesError.message); else setProfiles((profilesData || []) as Profile[]);
    if (incorporadorasError) setError(incorporadorasError.message); else setIncorporadoras((incorporadorasData || []) as Incorporadora[]);
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
  const visibleProfiles = useMemo(() => {
    const query = profileFilter.trim().toLocaleLowerCase();
    return profiles.filter(profile => !profile.is_superadmin && (!query || `${profile.nome || ''} ${profile.email || ''} ${roleLabels[profile.role]}`.toLocaleLowerCase().includes(query)));
  }, [profileFilter, profiles]);
  async function assume(profile: Profile) {
    setAssumingId(profile.id); setError(null);
    try { await startOperatingAs(profile); setProfile(profile.role as UserProfile); }
    catch (cause) { setError(cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Não foi possível iniciar a operação assistida.'); setAssumingId(null); }
  }
  async function assumeIncorporadora(incorporadora: Incorporadora) {
    setAssumingId(incorporadora.id); setError(null);
    try { await startOperatingOrganization({ id: incorporadora.id, nome: incorporadora.nome, incorporadora_id: incorporadora.id }); setProfile('incorporadora'); }
    catch (cause) { setError(cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Não foi possível abrir esta incorporadora.'); setAssumingId(null); }
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
    <Card className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4"><div><h2 className="font-semibold flex gap-2 items-center"><Shield size={17} />Operar como usuário</h2><p className="text-xs text-text-muted mt-1">Abre a plataforma na visão do usuário selecionado. A sua conta continua autenticada e a ação fica registrada.</p></div><label className="flex items-center gap-2 input h-9 w-full sm:w-72"><Search size={15} className="text-text-muted" /><input value={profileFilter} onChange={event => setProfileFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Buscar nome, e-mail ou perfil" /></label></div>
      {loading ? <div className="py-8 flex justify-center"><LoaderCircle className="animate-spin text-text-muted" /></div> : <div className="divide-y divide-border">{visibleProfiles.map(profile => <div key={profile.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"><div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0">{(profile.nome || profile.email || '?').charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{profile.nome || 'Usuário sem nome'}</p><p className="text-xs text-text-muted truncate">{profile.email || 'E-mail não informado'} · {roleLabels[profile.role]}</p></div><Button variant="secondary" disabled={assumingId !== null || !actualProfile?.is_superadmin} className="gap-2 text-xs" onClick={() => void assume(profile)}><Eye size={15} />{assumingId === profile.id ? 'Abrindo…' : 'Acessar como'}</Button></div>)}{!visibleProfiles.length && <p className="py-8 text-center text-sm text-text-muted">Nenhum usuário operacional encontrado.</p>}</div>}
    </Card>
    <Card className="p-5"><div className="mb-4"><h2 className="font-semibold flex gap-2 items-center"><Building2 size={17} />Operar como incorporadora</h2><p className="text-xs text-text-muted mt-1">Use quando a empresa já existe na operação, mesmo sem um usuário próprio criado.</p></div>{loading ? <div className="py-8 flex justify-center"><LoaderCircle className="animate-spin text-text-muted" /></div> : <div className="divide-y divide-border">{incorporadoras.map(incorporadora => <div key={incorporadora.id} className="flex items-center gap-3 py-3"><div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0"><Building2 size={17} /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{incorporadora.nome}</p><p className="text-xs text-text-muted">Incorporadora</p></div><Button variant="secondary" disabled={assumingId !== null || !actualProfile?.is_superadmin} className="gap-2 text-xs" onClick={() => void assumeIncorporadora(incorporadora)}><Eye size={15} />{assumingId === incorporadora.id ? 'Abrindo…' : 'Operar como incorporadora'}</Button></div>)}{!incorporadoras.length && <p className="py-8 text-center text-sm text-text-muted">Nenhuma incorporadora cadastrada.</p>}</div>}</Card>
  </div>;
}

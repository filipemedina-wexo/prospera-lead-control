import { useEffect, useMemo, useState } from 'react';
import { Building2, LoaderCircle, Save, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Profile } from '../../context/AuthContext';

type Empreendimento = { id: string; nome: string; gestora_id: string | null };
type Corretor = { id: string; nome: string; ativo: boolean };
type Imobiliaria = { id: string; organizacao_id: string; nome: string; ativo: boolean };
type Parceiro = { empreendimento_id: string; organizacao_id: string; imobiliaria_id: string | null; tipo: 'gestora' | 'imobiliaria'; ativo: boolean };
type Bloco = { id?: string; empreendimento_id: string; tipo: 'house' | 'imobiliaria'; corretor_id: string | null; imobiliaria_id: string | null; ordem: number; ativo: boolean };
type Dados = { empreendimentos: Empreendimento[]; house: Corretor[]; imobiliarias: Imobiliaria[]; parceiros: Parceiro[]; blocos: Bloco[] };

const empty: Dados = { empreendimentos: [], house: [], imobiliarias: [], parceiros: [], blocos: [] };

export function DistribuicaoLive({ authProfile }: { authProfile: Profile | null }) {
  const [dados, setDados] = useState<Dados>(empty);
  const [empreendimentoId, setEmpreendimentoId] = useState('');
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canManage = Boolean(authProfile?.is_superadmin || authProfile?.role === 'gestora_lancamentos');
  const selectedPartners = useMemo(() => new Set(parceiros.filter(p => p.ativo && p.imobiliaria_id).map(p => p.imobiliaria_id!)), [parceiros]);

  async function load() {
    setLoading(true); setMessage(null);
    const { data, error } = await supabase.rpc('listar_distribuicao_operacao');
    if (error) { setMessage(error.message); setLoading(false); return; }
    const next = (data || empty) as Dados;
    setDados(next);
    const first = empreendimentoId && next.empreendimentos.some(item => item.id === empreendimentoId) ? empreendimentoId : next.empreendimentos[0]?.id || '';
    setEmpreendimentoId(first);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    setBlocos(dados.blocos.filter(item => item.empreendimento_id === empreendimentoId).sort((a, b) => a.ordem - b.ordem));
    setParceiros(dados.parceiros.filter(item => item.empreendimento_id === empreendimentoId));
  }, [dados, empreendimentoId]);

  function togglePartner(imobiliariaId: string) {
    const existing = parceiros.find(item => item.imobiliaria_id === imobiliariaId);
    if (existing) setParceiros(items => items.map(item => item === existing ? { ...item, ativo: !item.ativo } : item));
    else setParceiros(items => [...items, { empreendimento_id: empreendimentoId, organizacao_id: dados.imobiliarias.find(item => item.id === imobiliariaId)?.organizacao_id || '', imobiliaria_id: imobiliariaId, tipo: 'imobiliaria', ativo: true }]);
  }
  function addHouse(corretorId: string) {
    if (!corretorId || blocos.some(item => item.corretor_id === corretorId)) return;
    setBlocos(items => [...items, { empreendimento_id: empreendimentoId, tipo: 'house', corretor_id: corretorId, imobiliaria_id: null, ordem: items.length + 1, ativo: true }]);
  }
  function addAgency(imobiliariaId: string) {
    if (!imobiliariaId || !selectedPartners.has(imobiliariaId) || blocos.some(item => item.imobiliaria_id === imobiliariaId)) return;
    setBlocos(items => [...items, { empreendimento_id: empreendimentoId, tipo: 'imobiliaria', corretor_id: null, imobiliaria_id: imobiliariaId, ordem: items.length + 1, ativo: true }]);
  }
  async function save() {
    if (!empreendimentoId) return;
    setSaving(true); setMessage(null);
    try {
      // O id da organização não vem da UI. A RPC valida o vínculo orgânico
      // do parceiro antes de aceitar cada bloco.
      const activeAgencyIds = parceiros.filter(item => item.ativo && item.imobiliaria_id).map(item => item.imobiliaria_id!);
      const orgIds = parceiros.filter(item => item.ativo && item.imobiliaria_id && activeAgencyIds.includes(item.imobiliaria_id)).map(item => item.organizacao_id);
      if (parceiros.some(item => item.ativo && !item.organizacao_id)) throw new Error('Esta imobiliária ainda não possui uma organização operacional vinculada.');
      const { error: partnersError } = await supabase.rpc('salvar_parceiros_empreendimento', { p_empreendimento_id: empreendimentoId, p_organizacoes: orgIds });
      if (partnersError) throw partnersError;
      const { error: blocksError } = await supabase.rpc('salvar_blocos_distribuicao_operacao', { p_empreendimento_id: empreendimentoId, p_blocos: blocos.map((item, index) => ({ tipo: item.tipo, corretor_id: item.corretor_id, imobiliaria_id: item.imobiliaria_id, ativo: item.ativo, ordem: index + 1 })) });
      if (blocksError) throw blocksError;
      setMessage('Distribuição publicada. Os próximos leads usarão esta fila.');
      await load();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Não foi possível salvar a distribuição.'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="p-8 flex gap-2 text-text-muted"><LoaderCircle className="animate-spin" size={18} />Carregando operação…</div>;
  if (!canManage) return <Card className="p-6"><h1 className="text-xl font-bold">Distribuição da equipe</h1><p className="text-sm text-text-secondary mt-2">A fila da imobiliária é configurada pelo gestor da sua organização. Não há dados demonstrativos neste ambiente.</p></Card>;

  return <div className="space-y-6 pb-12">
    <div><h1 className="text-2xl font-bold">Distribuição de leads</h1><p className="text-sm text-text-secondary mt-1">House da Gestora e blocos de imobiliárias parceiras. Cada agência mantém sua própria roleta.</p></div>
    {message && <div className="rounded-lg border border-brand/20 bg-brand/5 p-3 text-sm text-text-secondary">{message}</div>}
    {dados.empreendimentos.length === 0 ? <Card className="p-6 text-sm text-text-muted">Nenhum empreendimento disponível para sua organização.</Card> : <>
      <select className="input max-w-md" value={empreendimentoId} onChange={event => setEmpreendimentoId(event.target.value)}>{dados.empreendimentos.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4"><div><h2 className="font-semibold flex gap-2 items-center"><Building2 size={17} />Imobiliárias parceiras</h2><p className="text-xs text-text-muted mt-1">Somente parceiras ativas podem entrar na fila deste empreendimento.</p></div>
          <div className="space-y-2">{dados.imobiliarias.map(item => <label key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"><span>{item.nome}</span><input type="checkbox" checked={selectedPartners.has(item.id)} onChange={() => togglePartner(item.id)} /></label>)}</div>
        </Card>
        <Card className="p-5 space-y-4"><div><h2 className="font-semibold flex gap-2 items-center"><Users size={17} />Fila publicada</h2><p className="text-xs text-text-muted mt-1">A ordem abaixo é a roleta entre House e imobiliárias.</p></div>
          <div className="space-y-2">{blocos.map((item, index) => { const label = item.tipo === 'house' ? dados.house.find(c => c.id === item.corretor_id)?.nome : dados.imobiliarias.find(i => i.id === item.imobiliaria_id)?.nome; return <div key={`${item.tipo}-${item.corretor_id || item.imobiliaria_id}`} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"><span className="font-bold text-brand">{index + 1}</span><span className="flex-1">{label || 'Vínculo indisponível'} <small className="text-text-muted">· {item.tipo === 'house' ? 'House' : 'Parceira'}</small></span><button className="text-text-muted" onClick={() => setBlocos(items => items.filter(block => block !== item))}>Remover</button></div> })}</div>
          <div className="grid grid-cols-2 gap-2"><select className="input text-sm" defaultValue="" onChange={event => { addHouse(event.target.value); event.currentTarget.value = ''; }}><option value="">+ House</option>{dados.house.filter(item => item.ativo).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><select className="input text-sm" defaultValue="" onChange={event => { addAgency(event.target.value); event.currentTarget.value = ''; }}><option value="">+ Parceira</option>{dados.imobiliarias.filter(item => item.ativo && selectedPartners.has(item.id)).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
          <Button onClick={() => void save()} disabled={saving} className="w-full gap-2"><Save size={16} />{saving ? 'Publicando…' : 'Publicar distribuição'}</Button>
        </Card>
      </div>
    </>}
  </div>;
}

import { useEffect, useState } from 'react';
import { leads as mockLeads, type HistoricoEntry, type Lead, type LeadStatus } from '../data/mockData';
import { supabase } from './supabase';

const isMockMode = import.meta.env.VITE_APP_MODE === 'mock' || (import.meta.env.DEV && import.meta.env.VITE_APP_MODE !== 'live');

type LeadRow = {
  id: string; nome: string; telefone: string; email: string | null; empreendimento_id: string; imobiliaria_id: string | null;
  corretor_id: string | null; status: LeadStatus; tentativas_contato: number; ultima_tentativa: string | null; motivo_perdido: string | null;
  data_visita: string | null; first_response_at: string | null; public_token: string | null; criado_em: string;
  empreendimento?: { nome: string } | null;
  historico_leads?: Array<{ id: string; tipo: HistoricoEntry['tipo']; descricao: string; autor: string | null; de: string | null; para: string | null; criado_em: string }>;
  leituras_lead?: Array<{ primeira_leitura_em: string }>;
};

function toLead(row: LeadRow): Lead {
  return {
    id: row.id, nome: row.nome, telefone: row.telefone, email: row.email || undefined,
    empreendimentoId: row.empreendimento_id, empreendimentoNome: row.empreendimento?.nome, imobiliariaId: row.imobiliaria_id || '', corretorId: row.corretor_id || '',
    status: row.status, tentativasContato: row.tentativas_contato, ultimaTentativa: row.ultima_tentativa || undefined,
    motivoPerdido: row.motivo_perdido || undefined, dataVisita: row.data_visita || undefined,
    firstResponseAt: row.first_response_at || undefined, publicToken: row.public_token || undefined, criadoEm: row.criado_em,
    visualizadoEm: row.leituras_lead?.[0]?.primeira_leitura_em,
    historico: (row.historico_leads || []).map(item => ({ id: item.id, tipo: item.tipo, descricao: item.descricao, autor: item.autor || undefined, de: item.de || undefined, para: item.para || undefined, data: item.criado_em })),
  };
}

async function fetchLiveLead(id: string) {
  const { data, error } = await supabase.from('leads').select('*, empreendimento:empreendimentos(nome), historico_leads(*), leituras_lead(primeira_leitura_em)').eq('id', id).single();
  if (error) throw error;
  return toLead(data as LeadRow);
}

export function useBrokerLeads(corretorId?: string | null) {
  const [items, setItems] = useState<Lead[]>(() => isMockMode ? mockLeads.filter(lead => lead.corretorId === 'cor-1') : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode) return;
    let alive = true;
    if (!corretorId) return;
    supabase.from('leads').select('*, empreendimento:empreendimentos(nome), historico_leads(*), leituras_lead(primeira_leitura_em)').eq('corretor_id', corretorId).order('criado_em', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!alive) return;
        if (queryError) { setError(queryError.message); setItems([]); } else setItems(((data || []) as LeadRow[]).map(toLead));
        setLoading(false);
      });
    return () => { alive = false; };
  }, [corretorId]);
  return { items, loading, error };
}

export function useTenantLeads(incorporadoraId?: string | null) {
  const [items, setItems] = useState<Lead[]>(() => isMockMode ? mockLeads : []);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode) return;
    let alive = true;
    if (!incorporadoraId) { setItems([]); setLoading(false); return; }

    supabase
      .from('leads')
      .select('*, empreendimento:empreendimentos(nome), historico_leads(*), leituras_lead(primeira_leitura_em)')
      .eq('incorporadora_id', incorporadoraId)
      .order('criado_em', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!alive) return;
        if (queryError) { setError(queryError.message); setItems([]); }
        else setItems(((data || []) as LeadRow[]).map(toLead));
        setLoading(false);
      });

    return () => { alive = false; };
  }, [incorporadoraId]);

  return { items, loading, error };
}

export function useLead(id?: string | null) {
  const [item, setItem] = useState<Lead | null>(() => isMockMode ? mockLeads.find(lead => lead.id === id) || null : null);
  const [loading, setLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    if (!id) { setItem(null); return; }
    if (isMockMode) { setItem(mockLeads.find(lead => lead.id === id) || null); return; }
    try { setItem(await fetchLiveLead(id)); setError(null); } catch (cause) { setError(cause instanceof Error ? cause.message : 'NÃ£o foi possÃ­vel carregar o lead.'); } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, [id]);
  return { item, setItem, loading, error, refresh };
}

export async function marcarLeadComoLido(leadId: string) {
  if (isMockMode) return new Date().toISOString();
  const { data, error } = await supabase.rpc('registrar_leitura_lead', { p_lead_id: leadId });
  if (error) throw error;
  return data as string;
}

export async function atualizarLead(leadId: string, status: LeadStatus, observacao?: string, dataVisita?: string, motivoPerdido?: string) {
  if (isMockMode) return;
  const { error } = await supabase.rpc('atualizar_lead_operacional', {
    p_lead_id: leadId, p_status: status, p_observacao: observacao || null,
    p_data_visita: dataVisita || null, p_motivo_perdido: motivoPerdido || null,
  });
  if (error) throw error;
}

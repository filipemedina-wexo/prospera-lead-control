import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

type IncomingLead = {
  nome?: string
  name?: string
  full_name?: string
  telefone?: string
  phone?: string
  whatsapp?: string
  email?: string
  id?: string | number
  lead_id?: string | number
  origem?: string
  source?: string
  canal?: string
  campaign_id?: string | number
  campaign_name?: string
  campanha_id?: string | number
  campanha_nome?: string
  adset_id?: string | number
  adset_name?: string
  conjunto_id?: string | number
  conjunto_nome?: string
  ad_id?: string | number
  ad_name?: string
  anuncio_id?: string | number
  anuncio_nome?: string
  form_id?: string | number
  form_name?: string
  formulario_id?: string | number
  formulario_nome?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const optionalText = (value: unknown) => text(value) || null

function attributionFrom(payload: IncomingLead) {
  const campanhaId = optionalText(payload.campaign_id) || optionalText(payload.campanha_id)
  const conjuntoId = optionalText(payload.adset_id) || optionalText(payload.conjunto_id)
  const anuncioId = optionalText(payload.ad_id) || optionalText(payload.anuncio_id)
  const formularioId = optionalText(payload.form_id) || optionalText(payload.formulario_id)
  const hasMetaReference = Boolean(campanhaId || conjuntoId || anuncioId || formularioId)

  return {
    canal: optionalText(payload.canal) || optionalText(payload.origem) || optionalText(payload.source) || (hasMetaReference ? 'meta_ads' : 'outro'),
    campanha: { id: campanhaId, nome: optionalText(payload.campaign_name) || optionalText(payload.campanha_nome) },
    conjunto_anuncios: { id: conjuntoId, nome: optionalText(payload.adset_name) || optionalText(payload.conjunto_nome) },
    anuncio: { id: anuncioId, nome: optionalText(payload.ad_name) || optionalText(payload.anuncio_nome) },
    formulario: { id: formularioId, nome: optionalText(payload.form_name) || optionalText(payload.formulario_nome) },
    utm: {
      source: optionalText(payload.utm_source),
      medium: optionalText(payload.utm_medium),
      campaign: optionalText(payload.utm_campaign),
      content: optionalText(payload.utm_content),
      term: optionalText(payload.utm_term),
    },
  }
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (request.method !== 'POST') return json({ error: 'Use POST para enviar um lead.' }, 405)

  const url = new URL(request.url)
  const chavePublica = url.pathname.split('/').filter(Boolean).at(-1)
  const segredo = request.headers.get('x-prospera-secret')?.trim()

  if (!chavePublica || !segredo) return json({ error: 'Integração ou segredo ausente.' }, 401)

  let payload: IncomingLead
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Payload JSON inválido.' }, 400)
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'Payload deve ser um objeto JSON.' }, 422)
  }

  const nome = text(payload.nome) || text(payload.name) || text(payload.full_name)
  const telefone = text(payload.telefone) || text(payload.phone) || text(payload.whatsapp)
  const email = text(payload.email).toLowerCase() || null
  const atribuicao = attributionFrom(payload)
  if (!nome || !telefone) return json({ error: 'nome e telefone são obrigatórios.' }, 422)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Configuração do servidor incompleta.' }, 500)

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: integration, error: integrationError } = await supabase
    .rpc('validar_integracao_captacao', { p_chave_publica: chavePublica, p_segredo: segredo })
    .maybeSingle()

  if (integrationError || !integration) return json({ error: 'Integração inválida ou desativada.' }, 401)

  const externalId = String(payload.id ?? payload.lead_id ?? '').trim() || null
  const deduplicationKey = await sha256([integration.integracao_id, externalId || `${nome}|${telefone}|${email || ''}`].join('|').toLowerCase())
  const { data: receipt, error: receiptError } = await supabase
    .from('recebimentos_webhook')
    .insert({
      integracao_id: integration.integracao_id,
      id_externo: externalId,
      chave_deduplicacao: deduplicationKey,
      payload: { ...payload, _normalizado: { nome, telefone, email }, _atribuicao: atribuicao },
    })
    .select('id, status')
    .single()

  if (receiptError?.code === '23505') {
    return json({ accepted: true, duplicate: true, message: 'Lead já recebido nesta integração.' })
  }
  if (receiptError) return json({ error: 'Não foi possível registrar o lead.' }, 500)

  const { data: distribution, error: distributionError } = await supabase
    .rpc('distribuir_recebimento_webhook', { p_recebimento_id: receipt.id })
    .maybeSingle()

  if (distributionError || !distribution?.lead_id || !['processado', 'sem_responsavel'].includes(distribution.resultado)) {
    return json({ accepted: true, duplicate: false, receipt_id: receipt.id, status: 'pendente_de_revisao' }, 202)
  }
  const { error: attributionError } = await supabase
    .from('leads')
    .update({ origem: atribuicao })
    .eq('id', distribution.lead_id)

  if (attributionError) {
    return json({ accepted: true, duplicate: false, receipt_id: receipt.id, lead_id: distribution.lead_id, status: 'processado_sem_atribuicao' }, 202)
  }
  return json({ accepted: true, duplicate: false, receipt_id: receipt.id, lead_id: distribution.lead_id, status: distribution.resultado }, 201)
})

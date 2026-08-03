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
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
})

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

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
      payload: { ...payload, _normalizado: { nome, telefone, email } },
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

  if (distributionError || distribution?.resultado !== 'processado') {
    return json({ accepted: true, duplicate: false, receipt_id: receipt.id, status: 'pendente_de_revisao' }, 202)
  }
  return json({ accepted: true, duplicate: false, receipt_id: receipt.id, lead_id: distribution.lead_id, status: 'processado' }, 201)
})

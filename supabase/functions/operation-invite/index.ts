import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

type InviteBody = { email?: string; organizacao_id?: string; papel?: 'admin' | 'gestor' | 'corretor'; redirect_to?: string }
const allowedOrigins = new Set(['https://leadcontrol.useprospera.com.br', 'http://localhost:3000'])
const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://leadcontrol.useprospera.com.br',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

Deno.serve(async (request) => {
  const headers = corsHeaders(request.headers.get('origin'))
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Sessão obrigatória.' }, 401)
  const url = Deno.env.get('SUPABASE_URL')
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceRole) return json({ error: 'Configuração do servidor incompleta.' }, 500)
  const admin = createClient(url, serviceRole, { auth: { persistSession: false } })
  const { data: actorData, error: actorError } = await admin.auth.getUser(token)
  if (actorError || !actorData.user) return json({ error: 'Sessão inválida.' }, 401)
  const { data: actor } = await admin.from('profiles').select('is_superadmin').eq('id', actorData.user.id).single()
  if (!actor?.is_superadmin) return json({ error: 'Apenas a Central Prospera pode enviar convites operacionais.' }, 403)
  const body = await request.json() as InviteBody
  const email = body.email?.trim().toLowerCase()
  if (!email || !body.organizacao_id || !body.papel) return json({ error: 'E-mail, organização e papel são obrigatórios.' }, 422)
  const { data: org, error: orgError } = await admin.from('organizacoes').select('id, tipo, incorporadora_id, gestora_id, imobiliaria_id').eq('id', body.organizacao_id).single()
  if (orgError || !org) return json({ error: 'Organização não encontrada.' }, 404)
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: body.redirect_to || `${new URL(request.url).origin}/#/aceitar-convite`,
    data: { role: org.tipo },
  })
  if (inviteError || !invited.user) return json({ error: inviteError?.message || 'Não foi possível enviar o convite.' }, 422)
  const role = body.papel === 'corretor' ? 'corretor' : org.tipo
  let corretorId: string | null = null
  if (body.papel === 'corretor') {
    if (!org.gestora_id && !org.imobiliaria_id) return json({ error: 'Corretor precisa pertencer a uma gestora ou imobiliÃ¡ria.' }, 422)
    const { data: existingBroker, error: brokerLookupError } = await admin.from('corretores').select('id').eq('email', email).maybeSingle()
    if (brokerLookupError) return json({ error: brokerLookupError.message }, 500)
    if (existingBroker) corretorId = existingBroker.id
    else {
      const { data: broker, error: brokerError } = await admin.from('corretores').insert({
        nome: email.split('@')[0], email, gestora_id: org.gestora_id || null, imobiliaria_id: org.imobiliaria_id || null, ativo: true,
      }).select('id').single()
      if (brokerError || !broker) return json({ error: brokerError?.message || 'NÃ£o foi possÃ­vel preparar o corretor.' }, 500)
      corretorId = broker.id
    }
  }
  const { error: profileError } = await admin.from('profiles').update({
    email, role, incorporadora_id: org.incorporadora_id, gestora_id: org.gestora_id, imobiliaria_id: org.imobiliaria_id, corretor_id: corretorId,
  }).eq('id', invited.user.id)
  if (profileError) return json({ error: profileError.message }, 500)
  const { error: memberError } = await admin.from('organizacao_membros').upsert({ organizacao_id: org.id, profile_id: invited.user.id, papel: body.papel, ativo: true })
  if (memberError) return json({ error: memberError.message }, 500)
  return json({ ok: true })
})

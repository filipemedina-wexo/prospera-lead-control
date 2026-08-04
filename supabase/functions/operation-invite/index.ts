import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

type InviteBody = { email?: string; organizacao_id?: string; papel?: 'admin' | 'gestor' | 'corretor'; redirect_to?: string }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
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
  const { error: profileError } = await admin.from('profiles').update({
    email, role, incorporadora_id: org.incorporadora_id, gestora_id: org.gestora_id, imobiliaria_id: org.imobiliaria_id,
  }).eq('id', invited.user.id)
  if (profileError) return json({ error: profileError.message }, 500)
  const { error: memberError } = await admin.from('organizacao_membros').upsert({ organizacao_id: org.id, profile_id: invited.user.id, papel: body.papel, ativo: true })
  if (memberError) return json({ error: memberError.message }, 500)
  return json({ ok: true })
})

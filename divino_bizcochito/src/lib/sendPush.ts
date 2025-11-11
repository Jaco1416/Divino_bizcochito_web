import { supabaseAdmin } from '@/lib/supabaseAdmin'

type ExpoResponse = {
  data?: any
  errors?: any
}

async function sendExpoPush(token: string, title: string, body: string, data?: any) {
  try {
    const message: any = {
      to: token,
      title,
      body,
      sound: 'default'
    }
    if (data) message.data = data

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('⚠️ Expo push failed:', res.status, text)
      return { ok: false, status: res.status, text }
    }

    const json = await res.json()
    return { ok: true, json }
  } catch (err) {
    console.error('⚠️ Error sending expo push:', err)
    return { ok: false, error: err }
  }
}

export async function getTokensForPerfil(perfilId: string) {
  const tokens: string[] = []

  if (!perfilId) return tokens

  try {
    // Intentar leer columna en Perfiles (si existe expo_push_token)
    const { data: perfil, error: perfilErr } = await supabaseAdmin
      .from('Perfiles')
      .select('expo_push_token')
      .eq('id', perfilId)
      .single()

    if (!perfilErr && perfil?.expo_push_token) {
      tokens.push(perfil.expo_push_token)
    }
  } catch (e) {
    // ignorar: la columna puede no existir
  }

  try {
    // Buscar en tabla PushTokens si existe (varios tokens por perfil)
    const { data: rows, error: rowsErr } = await supabaseAdmin
      .from('PushTokens')
      .select('token')
      .eq('perfilId', perfilId)

    if (!rowsErr && Array.isArray(rows)) {
      for (const r of rows) if (r?.token) tokens.push(r.token)
    }
  } catch (e) {
    // ignorar
  }

  // dedupe
  return Array.from(new Set(tokens))
}

export async function sendPushToPerfil(perfilId: string, title: string, body: string, data?: any) {
  const tokens = await getTokensForPerfil(perfilId)

  if (!tokens.length) {
    console.log(`ℹ️ No hay tokens de push para perfil ${perfilId}`)
    return { sent: 0 }
  }

  let sent = 0
  for (const token of tokens) {
    const r = await sendExpoPush(token, title, body, data)
    if (r.ok) sent++
  }

  return { sent, total: tokens.length }
}

export default sendExpoPush

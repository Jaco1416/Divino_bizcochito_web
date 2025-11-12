import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { perfilId, userId, token } = body
    const perfil_id: string | undefined = perfilId ?? userId

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 })
    }

    const payload: Record<string, string> = { token }
    if (perfil_id) {
      payload.perfil_id = perfil_id
    }

    const query = supabaseAdmin.from('PushTokens')
    const rows = [payload]
    const { error } = perfil_id
      ? await query.upsert(rows, { onConflict: 'perfil_id' })
      : await query.insert(rows)

    if (error) {
      console.error('❌ Error guardando token de push:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: perfil_id
        ? 'Token sincronizado para el perfil.'
        : 'Token almacenado sin perfil asociado.',
    })
  } catch (err: any) {
    console.error('❌ Error en register push route:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

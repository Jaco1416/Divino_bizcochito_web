import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { perfilId, token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 })
    }

    // Primero intentar actualizar columna en Perfiles si existe
    if (perfilId) {
      try {
        const { error: upErr } = await supabaseAdmin
          .from('Perfiles')
          .update({ expo_push_token: token })
          .eq('id', perfilId)

        if (!upErr) {
          return NextResponse.json({ ok: true, message: 'Token guardado en Perfiles' })
        }
      } catch (e) {
        // ignorar y caer al fallback
      }
    }

    // Fallback: insertar en tabla PushTokens (crea la tabla si no existe)
    try {
      const payload: any = { token }
      if (perfilId) payload.perfilId = perfilId
      payload.createdAt = new Date().toISOString()

      const { error } = await supabaseAdmin.from('PushTokens').insert([payload])
      if (error) {
        console.warn('⚠️ No se pudo insertar en PushTokens:', error.message)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, message: 'Token guardado en PushTokens' })
    } catch (err: any) {
      console.error('❌ Error guardando token de push:', err.message)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
  } catch (err: any) {
    console.error('❌ Error en register push route:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

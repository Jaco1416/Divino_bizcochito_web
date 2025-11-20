import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { perfil_id, userId, token } = body

    // Determinar el perfil_id final
    const finalPerfilId: string | undefined = perfil_id ?? userId

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    if (!finalPerfilId) {
      return NextResponse.json(
        { ok: false, error: 'perfil_id no proporcionado' },
        { status: 400 }
      )
    }

    // Payload alineado con tu schema real
    const payload = {
      perfil_id: finalPerfilId,
      token
    }

    // UPSERT correctamente usando la columna UNIQUE: perfil_id
    const { error } = await supabaseAdmin
      .from('PushTokens')
      .upsert(payload, { onConflict: 'perfil_id' })

    if (error) {
      console.error('❌ Error guardando token de push:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: `Token sincronizado para el perfil ${finalPerfilId}.`
    })

  } catch (err: any) {
    console.error('❌ Error en register push route:', err.message)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

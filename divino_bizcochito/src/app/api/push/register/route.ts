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

    // Antes de hacer el upsert, nos aseguramos de que el token no esté asignado a otro perfil.
    // Esto es común si un usuario cierra sesión y otro inicia sesión en el mismo dispositivo.
    const { error: deleteError } = await supabaseAdmin
      .from('PushTokens')
      .delete()
      .eq('token', token)
      .not('perfil_id', 'eq', finalPerfilId)

    if (deleteError) {
      // No es un error fatal, solo un log. El siguiente upsert podría fallar y eso está bien.
      console.error('⚠️ Error eliminando token antiguo:', deleteError.message)
    }

    // UPSERT usando la columna UNIQUE: perfilId
    // Esto asocia el token con el perfil actual, o actualiza el token si el perfil ya tenía uno diferente.
    const { error: upsertError } = await supabaseAdmin
      .from('PushTokens')
      .upsert(payload, { onConflict: 'perfil_id' })

    if (upsertError) {
      console.error('❌ Error guardando token de push:', upsertError.message)
      return NextResponse.json(
        { ok: false, error: upsertError.message },
        { status: 500 }
      )
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

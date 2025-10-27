import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendCancelacionEmail } from "@/lib/sendEmail";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 🔹 1. Obtener el pedido
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from("Pedido")
      .select("id, total, estado, fk_pedido_perfiles, fechaCreacion")
      .eq("id", id)
      .single();

    if (pedidoError || !pedido) {
      console.error("❌ Error al obtener pedido:", pedidoError?.message);
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estado === "Cancelado" || pedido.estado === "Entregado") {
      return NextResponse.json(
        { message: "Este pedido ya no puede cancelarse." },
        { status: 400 }
      );
    }

    // 🔹 2. Obtener nombre del cliente desde tabla perfil
    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfil")
      .select("nombre")
      .eq("id", pedido.fk_pedido_perfiles)
      .single();

    if (perfilError) console.warn("⚠️ Error al obtener perfil:", perfilError.message);
    const nombreCliente = perfil?.nombre ?? "Cliente";

    // 🔹 3. Obtener correo desde Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      pedido.fk_pedido_perfiles
    );

    if (userError) console.warn("⚠️ Error al obtener usuario:", userError.message);
    const correoCliente = userData?.user?.email ?? null;

    // 🔹 4. Actualizar estado a "Cancelado"
    const { error: updateError } = await supabaseAdmin
      .from("Pedido")
      .update({ estado: "Cancelado" })
      .eq("id", id);

    if (updateError) {
      console.error("❌ Error al actualizar estado:", updateError.message);
      return NextResponse.json(
        { error: "Error al actualizar el pedido." },
        { status: 500 }
      );
    }

    console.log(`🛑 Pedido #${id} marcado como "Cancelado"`);

    // 🔹 5. Enviar correo si hay dirección disponible
    if (correoCliente) {
      try {
        const info = await sendCancelacionEmail({
          to: correoCliente,
          nombre: nombreCliente,
          pedidoId: pedido.id,
          total: pedido.total,
          fecha: pedido.fechaCreacion,
        });

        if (info?.accepted?.length) {
          console.log(`📧 Correo de cancelación enviado a ${correoCliente}`);
        } else {
          console.warn(`⚠️ No se pudo confirmar el envío del correo a ${correoCliente}`);
        }
      } catch (mailError: any) {
        console.error("⚠️ Error al enviar correo de cancelación:", mailError.message);
      }
    } else {
      console.warn("⚠️ No se encontró correo asociado al cliente, no se envió email.");
    }

    // 🔹 6. Responder al cliente
    return NextResponse.json(
      { message: "Pedido cancelado correctamente." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error al cancelar pedido:", err.message);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

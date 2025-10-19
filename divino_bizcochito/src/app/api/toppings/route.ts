import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TABLE_NAME = "Topping";

// ============================================================
// 📥 GET → Obtener todos los rellenos
// ============================================================
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .select("*")
      .order("nombre", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET /Topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ➕ POST → Crear un nuevo relleno
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert([
        {
          nombre: body.nombre,
          descripcion: body.descripcion || null,
          disponible: body.disponible ?? true,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /Topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// 🛠️ PUT → Actualizar un relleno existente por ID
// ============================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Se requiere un ID para actualizar" },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body;

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error PUT /Topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// ❌ DELETE → Eliminar un relleno por ID
// ============================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere un ID para eliminar" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from(TABLE_NAME).delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json(
      { message: `Topping ${id} eliminado correctamente` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error DELETE /Topping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

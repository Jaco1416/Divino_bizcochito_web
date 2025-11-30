import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Configuracion = {
  capacidadDiaria: number;
  maxProductosPorPedido: number;
  leadTimeMinimoDias: number;
  diasBloqueados: string[];
};

const DEFAULT_CONFIG: Configuracion = {
  capacidadDiaria: 30,
  maxProductosPorPedido: 15,
  leadTimeMinimoDias: 3,
  diasBloqueados: [],
};

const ESTADOS_ABIERTOS = ["Recibido", "En Producción"];
const HORIZONTE_DIAS = 14; // cuántos días hacia adelante devolvemos
const HORA_CORTE = 20; // pedidos después de esta hora se empujan un día extra
const LEAD_TIME_MINIMO_DIAS = 3;

const formatISODate = (date: Date) => date.toISOString().slice(0, 10);

const obtenerConfig = async (): Promise<Configuracion> => {
  const { data, error } = await supabaseAdmin
    .from("ConfiguracionProduccion")
    .select(
      `
        capacidadDiaria,
        maxProductosPorPedido,
        leadTimeMinimoDias,
        diasBloqueados
      `
    )
    .limit(1)
    .single();

  if (error || !data) {
    console.warn(
      "⚠️ Usando config por defecto: no se encontró ConfiguracionProduccion.",
      error?.message || error
    );
    return DEFAULT_CONFIG;
  }

  return {
    capacidadDiaria: data.capacidadDiaria ?? DEFAULT_CONFIG.capacidadDiaria,
    maxProductosPorPedido: data.maxProductosPorPedido ?? DEFAULT_CONFIG.maxProductosPorPedido,
    leadTimeMinimoDias: data.leadTimeMinimoDias ?? DEFAULT_CONFIG.leadTimeMinimoDias,
    diasBloqueados: data.diasBloqueados ?? DEFAULT_CONFIG.diasBloqueados,
  };
};

const obtenerCargaPorDia = async () => {
  const { data: pedidos, error: errPedidos } = await supabaseAdmin
    .from("Pedido")
    .select("id, estado, fechaEntrega")
    .in("estado", ESTADOS_ABIERTOS);

  if (errPedidos) throw errPedidos;
  if (!pedidos || pedidos.length === 0) return {};

  const pedidoIds = pedidos.map((p) => p.id);

  const { data: detalles, error: errDetalles } = await supabaseAdmin
    .from("DetallePedido")
    .select("pedidoId, cantidad")
    .in("pedidoId", pedidoIds);

  if (errDetalles) throw errDetalles;

  // Sumar cantidades por pedido
  const cargaPorPedido: Record<number, number> = {};
  detalles?.forEach((d) => {
    // Si la cantidad viene nula o no numérica, asumimos 1 para no dejar sin cupo ese pedido.
    const cantidad = Number(d.cantidad);
    const cantidadValida = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
    cargaPorPedido[d.pedidoId] = (cargaPorPedido[d.pedidoId] || 0) + cantidadValida;
  });

  // Sumar por fechaEntrega (ignora pedidos sin fecha asignada)
  const cargaPorDia: Record<string, number> = {};
  pedidos.forEach((p) => {
    if (!p.fechaEntrega) return;
    const fecha = formatISODate(new Date(p.fechaEntrega));
    const cargaPedido = cargaPorPedido[p.id] || 0;
    cargaPorDia[fecha] = (cargaPorDia[fecha] || 0) + cargaPedido;
  });

  return cargaPorDia;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemsSolicitados = Number(searchParams.get("items")) || 0;

    const config = await obtenerConfig();
    const cargaPorDia = await obtenerCargaPorDia();
    const leadTimeMinimoDias = Math.max(config.leadTimeMinimoDias, LEAD_TIME_MINIMO_DIAS);

    const ahora = new Date();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const slots: { fecha: string; carga: number; restante: number }[] = [];
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() + leadTimeMinimoDias);

    // Si ya pasó la hora de corte, el primer día elegible se mueve un día más
    if (ahora.getHours() >= HORA_CORTE) {
      inicio.setDate(inicio.getDate() + 1);
    }

    for (let i = 0; i < HORIZONTE_DIAS; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      const fechaStr = formatISODate(fecha);

      if (config.diasBloqueados?.includes(fechaStr)) continue;

      const cargaDia = cargaPorDia[fechaStr] || 0;
      const restante = Math.max(config.capacidadDiaria - cargaDia, 0);

      // Si no alcanza la capacidad para el carrito actual, inhabilitamos el día
      if (itemsSolicitados > 0 && restante < itemsSolicitados) continue;

      // Verificación extra contra la función de BD (si existe), para asegurar el cupo
      if (itemsSolicitados > 0) {
        const { data: cupoOk, error: errCupo } = await supabaseAdmin.rpc(
          "verificar_cupo_disponible",
          {
            fecha_solicitada: fechaStr,
            cantidad_solicitada: itemsSolicitados,
          }
        );

        if (errCupo) {
          console.warn("⚠️ Error verificando cupo en BD:", errCupo);
        } else if (cupoOk === false) {
          continue;
        }
      }

      slots.push({ fecha: fechaStr, carga: cargaDia, restante });
    }

    const superaMaximo = itemsSolicitados > config.maxProductosPorPedido;

    return NextResponse.json(
      {
        config: { ...config, leadTimeMinimoDias },
        itemsSolicitados,
        superaMaximo,
        slots,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Error en GET /api/configPedidos:", error.message || error);
    return NextResponse.json(
      { error: "No se pudo obtener la configuración de pedidos" },
      { status: 500 }
    );
  }
}

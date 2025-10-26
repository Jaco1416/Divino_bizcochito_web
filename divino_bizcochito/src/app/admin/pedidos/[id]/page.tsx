"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import BackButton from "@/app/components/BackButton/BackButton";

interface DatosEnvio {
    nombre: string;
    correo: string;
    direccion: string;
    comentarios?: string;
}

interface DetallePedido {
    id: number;
    cantidad: number;
    precioUnitario: number;
    nombreProducto: string;
    imagenProducto: string | null;
    toppingId: number | null;
    rellenoId: number | null;
}

interface Pedido {
    id: number;
    tipoEntrega: string;
    datosEnvio: DatosEnvio | null;
    estado: string;
    fechaCreacion: string;
    fechaEntrega: string | null;
    total: number;
    perfil: {
        nombre: string;
    };
    detalle_pedido: DetallePedido[];
}

const estadosOrdenados = [
    "Recibido",
    "En Producción",
    "Listo",
    "Entregado",
    "Cancelado",
];

export default function DetallePedidoPage() {
    const { id } = useParams();
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // 🔁 Obtener pedido y detalles
    const fetchPedido = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("Pedido")
                .select(
                    `
          id,
          tipoEntrega,
          datosEnvio,
          estado,
          fechaCreacion,
          fechaEntrega,
          total,
          perfil:fk_pedido_perfiles ( nombre ),
          detalle_pedido:DetallePedido (
            id,
            cantidad,
            precioUnitario,
            nombreProducto,
            imagenProducto,
            toppingId,
            rellenoId
          )
        `
                )
                .eq("id", id)
                .single();

            if (error) throw error;
            setPedido(data as Pedido);
            if (data?.fechaEntrega) setSelectedDate(new Date(data.fechaEntrega));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedido();
    }, [id]);

    // 🔄 Avanzar estado
    const avanzarEstado = async () => {
        if (!pedido) return;
        const indexActual = estadosOrdenados.indexOf(pedido.estado);
        const siguienteEstado = estadosOrdenados[indexActual + 1];
        if (!siguienteEstado || pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
            console.warn("No se puede avanzar más el estado del pedido.");
            return;
        }

        try {
            setUpdating(true);
            const { error } = await supabase
                .from("Pedido")
                .update({ estado: siguienteEstado })
                .eq("id", pedido.id);

            if (error) throw error;
            setPedido({ ...pedido, estado: siguienteEstado });
            console.log(`✅ Estado del pedido #${pedido.id} actualizado a: ${siguienteEstado}`);
        } catch (err) {
            console.error("❌ Error al avanzar el estado del pedido:", err);
        } finally {
            setModalOpen(false);
            setUpdating(false);
        }
    };

    // ❌ Cancelar pedido
    const cancelarPedido = async () => {
        if (!pedido) return;
        try {
            setUpdating(true);
            const { error } = await supabase
                .from("Pedido")
                .update({ estado: "Cancelado" })
                .eq("id", pedido.id);
            if (error) throw error;
            setPedido({ ...pedido, estado: "Cancelado" });
        } catch (err) {
            console.error(err);
        } finally {
            fetchPedido();
            setUpdating(false);
        }
    };

    // 📅 Actualizar fecha de entrega
    const actualizarFechaEntrega = async (date: Date) => {
        if (!pedido) return;
        try {
            setUpdating(true);
            const { error } = await supabase
                .from("Pedido")
                .update({ fechaEntrega: date.toISOString() })
                .eq("id", pedido.id);

            if (error) throw error;
            setSelectedDate(date);
            setPedido({ ...pedido, fechaEntrega: date.toISOString() });
            console.log(`📅 Fecha de entrega actualizada a: ${date.toISOString()}`);
        } catch (err) {
            console.error("❌ Error al actualizar la fecha de entrega:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p className="text-center mt-8">Cargando pedido...</p>;
    if (!pedido) return <p className="text-center mt-8">Pedido no encontrado</p>;

    return (
        <div className="max-w-5xl mx-auto mt-10 mb-20 space-y-10">
            <BackButton/>
            {/* 🧁 Tabla de productos */}
            <section>
                <h2 className="text-xl font-semibold mb-3 text-[#530708] text-center">
                    Productos del Pedido #{pedido.id}
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-[#e0d3c0] rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-[#7c0a02] text-white">
                                <th className="py-2 px-4 text-left font-semibold">Producto</th>
                                <th className="py-2 px-4 text-center font-semibold">Cantidad</th>
                                <th className="py-2 px-4 text-center font-semibold">Precio Unitario</th>
                                <th className="py-2 px-4 text-center font-semibold">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white text-gray-800">
                            {pedido.detalle_pedido?.length > 0 ? (
                                pedido.detalle_pedido.map((d) => (
                                    <tr key={d.id} className="border-t border-[#e0d3c0]">
                                        <td className="py-3 px-4 flex items-center gap-3">
                                            {d.imagenProducto && (
                                                <img
                                                    src={d.imagenProducto}
                                                    alt={d.nombreProducto}
                                                    className="w-14 h-14 object-cover rounded-md border border-[#e0d3c0]"
                                                />
                                            )}
                                            <span className="font-medium">{d.nombreProducto}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">{d.cantidad}</td>
                                        <td className="py-3 px-4 text-center">
                                            ${d.precioUnitario.toLocaleString("es-CL")}
                                        </td>
                                        <td className="py-3 px-4 text-center font-semibold">
                                            ${(d.cantidad * d.precioUnitario).toLocaleString("es-CL")}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                                        Este pedido no contiene productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 📅 Fecha de entrega */}
            {pedido.estado !== "Entregado" && pedido.estado !== "Cancelado" && (
                <section className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-[#530708]">Fecha de entrega</h3>
                    <div className="flex items-center gap-3">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                if (!date) return;
                                setSelectedDate(date); // ✅ Actualiza el input al instante
                                actualizarFechaEntrega(date); // ✅ Luego guarda en Supabase
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Selecciona una fecha"
                            className="border border-[#e0d3c0] rounded-md px-3 py-2 w-52"
                        />
                    </div>
                </section>
            )}

            {/* 👤 Datos del pedido */}
            <section className="text-gray-800 space-y-2">
                <h2 className="text-xl font-bold mb-3 text-[#530708]">Datos del Pedido</h2>

                <p><strong>Cliente:</strong> {pedido.perfil?.nombre}</p>
                <p><strong>Tipo de entrega:</strong> {pedido.tipoEntrega}</p>
                <p ><strong>Pedido: </strong>
                    <span className={`
      px-3 py-1 rounded-full text-sm font-semibold
      ${pedido.estado === "Recibido"
                            ? "bg-blue-100 text-blue-700"
                            : pedido.estado === "En Producción"
                                ? "bg-yellow-100 text-yellow-800"
                                : pedido.estado === "Listo"
                                    ? "bg-green-100 text-green-700"
                                    : pedido.estado === "Entregado"
                                        ? "bg-gray-200 text-gray-700"
                                        : pedido.estado === "Cancelado"
                                            ? "bg-red-100 text-red-700"
                                            : ""
                        }
                        `}
                    >
                        {pedido.estado}
                    </span>
                </p>

                {pedido.datosEnvio && (
                    <div className="mt-4 space-y-1">
                        <p><strong>Nombre:</strong> {pedido.datosEnvio.nombre}</p>
                        <p><strong>Correo:</strong> {pedido.datosEnvio.correo}</p>
                        <p><strong>Dirección:</strong> {pedido.datosEnvio.direccion}</p>
                        {pedido.datosEnvio.comentarios && (
                            <p><strong>Comentarios:</strong> {pedido.datosEnvio.comentarios}</p>
                        )}
                    </div>
                )}

                <p><strong>Fecha creación:</strong> {new Date(pedido.fechaCreacion).toLocaleString()}</p>
                {pedido.fechaEntrega && (
                    <p><strong>Fecha entrega:</strong> {new Date(pedido.fechaEntrega).toLocaleString()}</p>

                )}
                {!pedido.fechaEntrega && (
                    <p className="text-sm text-amber-600 mt-1">
                        <strong className="text-gray-800">Fecha entrega:</strong>⚠️ No se ha establecido una fecha de entrega.
                    </p>
                )}
                <p><strong>Total:</strong> ${pedido.total.toLocaleString("es-CL")}</p>
            </section>

            {/* 🔘 Botones */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={cancelarPedido}
                    disabled={updating || pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                    className={`
                                px-4 py-2 rounded-md font-semibold text-white transition
                                ${pedido.estado === "Cancelado" || pedido.estado === "Entregado"
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700"}
                                disabled:bg-gray-400 disabled:cursor-default
                            `}
                >
                    Cancelar
                </button>

                <button
                    onClick={() => setModalOpen(true)}
                    disabled={
                        updating ||
                        pedido.estado === "Entregado" ||
                        pedido.estado === "Cancelado"
                    }
                    className={`px-4 py-2 rounded-md font-semibold cursor-pointer text-white ${pedido.estado === "Entregado" || pedido.estado === "Cancelado"
                        ? "bg-gray-400 disabled:cursor-default"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    Avanzar estado
                </button>
            </div>
            <ConfirmModal
                isOpen={modalOpen}
                title="Avanzar estado del pedido"
                message="¿Estás seguro de avanzar el estado de este pedido? Esta acción no se puede deshacer."
                confirmText="Avanzar"
                cancelText="Cancelar"
                onConfirm={avanzarEstado}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

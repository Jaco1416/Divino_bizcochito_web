"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
    perfil: { nombre: string };
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

    // 🔁 Obtener pedido desde el backend
    const fetchPedido = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/pedidos/${id}`);
            if (!res.ok) throw new Error("Error al obtener pedido");
            const data = await res.json();
            setPedido(data);
            if (data?.fechaEntrega) setSelectedDate(new Date(data.fechaEntrega));
        } catch (err) {
            console.error("❌ Error al obtener pedido:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedido();
    }, [id]);

    // 🔄 Avanzar estado (usa API)
    const avanzarEstado = async () => {
        if (!pedido) return;
        try {
            setUpdating(true);
            const res = await fetch(`/api/pedidos/${pedido.id}/estado`, {
                method: "PUT",
            });
            if (!res.ok) throw new Error("Error al avanzar estado");

            const result = await res.json();
            console.log("✅", result.message);
            await fetchPedido(); // 🔁 refresca datos
        } catch (err) {
            console.error("❌ Error al avanzar estado:", err);
        } finally {
            setModalOpen(false);
            setUpdating(false);
        }
    };

    // ❌ Cancelar pedido (usa API)
    const cancelarPedido = async () => {
        if (!pedido) return;
        try {
            setUpdating(true);
            const res = await fetch(`/api/pedidos/${pedido.id}/cancelar`, {
                method: "PUT",
            });
            if (!res.ok) throw new Error("Error al cancelar pedido");

            console.log("🛑 Pedido cancelado correctamente");
            await fetchPedido();
        } catch (err) {
            console.error("❌ Error al cancelar pedido:", err);
        } finally {
            setUpdating(false);
        }
    };

    // 📅 Actualizar fecha de entrega (usa API)
    const actualizarFechaEntrega = async (date: Date) => {
        if (!pedido) return;
        try {
            setUpdating(true);
            const res = await fetch(`/api/pedidos/${pedido.id}/entrega`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fechaEntrega: date.toISOString() }),
            });

            if (!res.ok) throw new Error("Error al actualizar fecha de entrega");

            setSelectedDate(date);
            console.log(`📅 Fecha de entrega actualizada a: ${date.toISOString()}`);
            await fetchPedido();
        } catch (err) {
            console.error("❌ Error al actualizar la fecha de entrega:", err);
        } finally {
            setUpdating(false);
        }
    };

    // 🗑️ Eliminar pedido (usa API DELETE)
    const eliminarPedido = async () => {
        if (!pedido) return;
        if (!confirm("¿Seguro que deseas eliminar este pedido?")) return;

        try {
            setUpdating(true);
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error al eliminar pedido");
            alert("Pedido eliminado correctamente ✅");
            window.location.href = "/admin/pedidos"; // redirige al listado
        } catch (err) {
            console.error("❌ Error al eliminar pedido:", err);
        } finally {
            setUpdating(false);
        }
    };

    // 🧩 Carga y renderizado
    if (loading) return <p className="text-center mt-8">Cargando pedido...</p>;
    if (!pedido) return <p className="text-center mt-8">Pedido no encontrado</p>;

    return (
        <div className="max-w-5xl mx-auto mt-10 mb-20 space-y-10">
            <BackButton />

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
                            onChange={(date) => date && actualizarFechaEntrega(date)}
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
                <p>
                    <strong>Estado: </strong>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${pedido.estado === "Recibido"
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
                            }`}
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
                {pedido.fechaEntrega ? (
                    <p><strong>Fecha entrega:</strong> {new Date(pedido.fechaEntrega).toLocaleString()}</p>
                ) : (
                    <p className="text-sm text-amber-600 mt-1">
                        ⚠️ No se ha establecido una fecha de entrega.
                    </p>
                )}
                <p><strong>Total:</strong> ${pedido.total.toLocaleString("es-CL")}</p>
            </section>

            {/* 🔘 Botones */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={cancelarPedido}
                    disabled={updating || pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                    className={`px-4 py-2 rounded-md font-semibold text-white transition ${pedido.estado === "Cancelado" || pedido.estado === "Entregado"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 cursor-pointer"
                        }`}
                >
                    Cancelar
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={() => setModalOpen(true)}
                        disabled={
                            updating || pedido.estado === "Entregado" || pedido.estado === "Cancelado"
                        }
                        className={`px-4 py-2 rounded-md font-semibold text-white ${pedido.estado === "Entregado" || pedido.estado === "Cancelado"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700  cursor-pointer"
                            }`}
                    >
                        Avanzar estado
                    </button>

                    <button
                        onClick={eliminarPedido}
                        className="px-4 py-2 rounded-md font-semibold text-white bg-[#530708] hover:bg-[#3d0606] cursor-pointer"
                    >
                        Eliminar
                    </button>
                </div>
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

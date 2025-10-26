"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Pedido {
    id: number;
    tipoEntrega: string;
    datosEnvio: any;
    estado: string;
    fechaCreacion: string;
    fechaEntrega: string | null;
    total: number;
    perfil: {
        nombre: string | null;
    } | null;
}

export default function PedidosTable() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const { data, error } = await supabase
            .from("Pedido")
            .select(`
                id,
                tipoEntrega,
                datosEnvio,
                estado,
                fechaCreacion,
                fechaEntrega,
                total,
                perfil:fk_pedido_perfiles ( nombre )
            `)
            .order("fechaCreacion", { ascending: false });

                if (error) throw error;
                // 👇 ahora TypeScript acepta correctamente el tipo
                setPedidos((data as unknown as Pedido[]) ?? []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    if (loading) return <p className="text-center text-white mt-8">Cargando pedidos...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">Error: {error}</p>;

    return (
        <div className="w-full flex justify-center mt-6 mb-15">
            <div className="w-full max-w-6xl px-6 py-4">
                <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
                    Gestionar pedidos
                </h1>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">ID</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Cliente</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Tipo entrega</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Estado</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha creación</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Fecha entrega</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Total</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pedidos.map((p) => (
                                <tr
                                    key={p.id}
                                    className="bg-[#A26B6B] text-white border border-[#fff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A]">{p.id}</td>

                                    {/* ✅ Muestra el nombre del cliente desde el join */}
                                    <td className="px-4 py-2 border border-[#8B3A3A] truncate max-w-[150px]">
                                        {p.perfil?.nombre || "Sin nombre"}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A] capitalize">
                                        {p.tipoEntrega}
                                    </td>

                                    <td
                                        className={`px-4 py-2 border border-[#8B3A3A] font-semibold ${p.estado === "Recibido"
                                                ? "text-blue-300"
                                                : p.estado === "En producción"
                                                    ? "text-yellow-300"
                                                    : p.estado === "Listo"
                                                        ? "text-green-300"
                                                        : p.estado === "Entregado"
                                                            ? "text-purple-300"
                                                            : p.estado === "Cancelado"
                                                                ? "text-red-500"
                                                                : "text-white"
                                            }`}
                                    >
                                        {p.estado}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {new Date(p.fechaCreacion).toLocaleDateString("es-CL")}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {p.fechaEntrega
                                            ? new Date(p.fechaEntrega).toLocaleDateString("es-CL")
                                            : "pendiente"}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        ${p.total.toLocaleString("es-CL")}
                                    </td>

                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/pedidos/${p.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition">
                                                    Ver
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => alert(`Eliminar pedido ${p.id}`)}
                                                className="bg-[#530708] hover:bg-[#3D0506] text-white font-semibold px-3 py-1 rounded transition"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pedidos.length === 0 && (
                        <p className="text-center text-white mt-4">No hay pedidos registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

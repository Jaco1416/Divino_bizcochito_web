"use client";
import { useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import Link from "next/link";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface Relleno {
    id: string;
    nombre: string;
    descripcion?: string;
    disponible: boolean;
}

interface RellenoTableProps {
    rellenos: Relleno[];
}

export default function RellenoTable({ rellenos }: RellenoTableProps) {

    const { showAlert } = useAlert();

    // Estado local para la lista de rellenos
    const [rellenosList, setRellenosList] = useState<Relleno[]>(rellenos);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRellenoId, setSelectedRellenoId] = useState<string | null>(null);

    // 🧱 Abrir modal
    const handleDeleteClick = (id: string) => {
        setSelectedRellenoId(id);
        setModalOpen(true);
    };

    // 🧱 Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!selectedRellenoId) return;

        try {
            const res = await fetch(`/api/relleno?id=${selectedRellenoId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar relleno");

            showAlert("✅ Relleno eliminado correctamente", "success");

            // ✅ Actualizar lista local (sin volver a hacer fetch)
            setRellenosList((prev) => prev.filter((r) => r.id !== selectedRellenoId));
        } catch (error) {
            console.error("❌ Error al eliminar relleno:", error);
            showAlert("❌ No se pudo eliminar el relleno", "error");
        } finally {
            setModalOpen(false);
            setSelectedRellenoId(null);
        }
    };

    if (rellenosList.length === 0) {
        return (
            <p className="text-center text-gray-600 mt-6">
                No hay rellenos registrados.
            </p>
        );
    }

    return (
        <div className="w-full flex justify-center mt-6">
            <div className="w-full max-w-6xl px-6 py-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Descripción</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rellenosList.map((relleno) => (
                                <tr
                                    key={relleno.id}
                                    className="bg-[#A26B6B] text-white border border-[#ffff] transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium">
                                        {relleno.nombre}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {relleno.descripcion || "-"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/rellenos/${relleno.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(relleno.id)}
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
                </div>
            </div>

            {/* 🧩 Modal de confirmación */}
            <ConfirmModal
                isOpen={modalOpen}
                title="Eliminar relleno"
                message="¿Estás seguro de eliminar este relleno? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

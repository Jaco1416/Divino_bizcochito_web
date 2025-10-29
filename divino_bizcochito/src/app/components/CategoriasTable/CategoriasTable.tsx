"use client";
import { useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import Link from "next/link";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface CategoriasTableProps {
  categorias: Categoria[];
}

export default function CategoriasTable({ categorias }: CategoriasTableProps) {
  const { showAlert } = useAlert();

  const [categoriasList, setCategoriasList] = useState<Categoria[]>(categorias);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(
    null
  );

  // 🧱 Abrir modal
  const handleDeleteClick = (id: string) => {
    setSelectedCategoriaId(id);
    setModalOpen(true);
  };

  // 🧱 Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedCategoriaId) return;

    try {
      const res = await fetch(`/api/categorias?id=${selectedCategoriaId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar categoría");

      showAlert("✅ Categoría eliminada correctamente", "success");

      // ✅ Actualizar lista local (sin refetch)
      setCategoriasList((prev) =>
        prev.filter((c) => c.id !== selectedCategoriaId)
      );
    } catch (error) {
      console.error("❌ Error al eliminar categoría:", error);
      showAlert("❌ No se pudo eliminar la categoría", "error");
    } finally {
      setModalOpen(false);
      setSelectedCategoriaId(null);
    }
  };

  if (categoriasList.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-6">
        No hay categorías registradas.
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
                <th className="px-4 py-3 border border-[#8B3A3A]">
                  Descripción
                </th>
                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasList.map((categoria) => (
                <tr
                  key={categoria.id}
                  className="bg-[#A26B6B] text-white border border-[#ffff] transition-colors"
                >
                  <td className="px-4 py-2 border border-[#8B3A3A] font-medium">
                    {categoria.nombre}
                  </td>
                  <td className="px-4 py-2 border border-[#8B3A3A]">
                    {categoria.descripcion || "-"}
                  </td>
                  <td className="px-4 py-2 border border-[#8B3A3A]">
                    <div className="flex justify-center gap-3">
                      <Link href={`/admin/categorias/${categoria.id}`}>
                        <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition">
                          Editar
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(categoria.id)}
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
        title="Eliminar categoría"
        message="¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

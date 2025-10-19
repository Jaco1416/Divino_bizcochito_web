"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "../ui/ConfirmModal";

interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    disponible: boolean;
    imagen: string;
    categoriaId: string;
    toppingId: string;
    rellenoId: string;
}

interface Categoria {
    id: string;
    nombre: string;
}

interface Topping {
    id: string;
    nombre: string;
}

interface Relleno {
    id: string;
    nombre: string;
}

interface ProductTableProps {
    productos: Producto[];
}

export default function ProductTable({ productos }: ProductTableProps) {

    const { showAlert } = useAlert();

    const [lista, setLista] = useState<Producto[]>(productos);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [rellenos, setRellenos] = useState<Relleno[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);



    // 🧱 Abrir modal
    const handleDeleteClick = (id: string) => {
        setDeleteProductId(id);
        setModalOpen(true);
    };

    // 🧱 Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!deleteProductId) return;

        try {
            const res = await fetch(`/api/productos?id=${deleteProductId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al eliminar producto");

            showAlert("✅ Producto eliminado correctamente", "success");

            // ✅ Actualizar lista local (sin volver a hacer fetch)
            setLista((prev) => prev.filter((p) => p.id !== deleteProductId));
        } catch (error) {
            console.error("❌ Error al eliminar producto:", error);
            showAlert("❌ No se pudo eliminar el producto", "error");
        } finally {
            setModalOpen(false);
            setDeleteProductId(null);
        }
    };


    // 🔁 Cargar catálogos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, topRes, relRes] = await Promise.all([
                    fetch("/api/categorias"),
                    fetch("/api/toppings"),
                    fetch("/api/relleno"),
                ]);

                const [catData, topData, relData] = await Promise.all([
                    catRes.json(),
                    topRes.json(),
                    relRes.json(),
                ]);

                setCategorias(catData);
                setToppings(topData);
                setRellenos(relData);
            } catch (err) {
                console.error("❌ Error cargando catálogos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-600 mt-6">Cargando productos...</p>;
    }

    if (lista.length === 0) {
        return (
            <p className="text-center text-gray-600 mt-6">
                No hay productos registrados.
            </p>
        );
    }

    // 🔍 Buscar nombre de catálogo por ID
    const getNombre = (lista: any[], id: string) =>
        lista.find((item) => item.id === id)?.nombre || "-";

    const handleDelete = async (id: string) => {
        const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");
        if (!confirmar) return;

        try {
            const res = await fetch(`/api/productos?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al eliminar producto");

            alert("✅ Producto eliminado correctamente");
            setLista((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            console.error("❌ Error al eliminar producto:", error);
            alert("❌ No se pudo eliminar el producto");
        }
    };

    return (
        <div className="w-full flex justify-center mt-6">
            <div className="w-full max-w-6xl px-6 py-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-center text-sm text-white">
                        <thead className="bg-[#530708] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Imagen</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Nombre</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Descripción</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Categoría</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Topping</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Relleno</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Precio</th>
                                <th className="px-4 py-3 border border-[#8B3A3A]">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lista.map((prod) => (
                                <tr
                                    key={prod.id}
                                    className="bg-[#A26B6B] text-white border border-[#fff]  transition-colors"
                                >
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <img
                                            src={prod.imagen}
                                            alt={prod.nombre}
                                            className="w-12 h-12 rounded-lg object-cover mx-auto border border-white"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A] font-medium capitalize">
                                        {prod.nombre}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {prod.descripcion || "-"}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {getNombre(categorias, prod.categoriaId)}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {getNombre(toppings, prod.toppingId)}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        {getNombre(rellenos, prod.rellenoId)}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        ${prod.precio.toLocaleString("es-CL")}
                                    </td>
                                    <td className="px-4 py-2 border border-[#8B3A3A]">
                                        <div className="flex justify-center gap-3">
                                            <Link href={`/admin/productos/${prod.id}`}>
                                                <button className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-3 py-1 rounded transition">
                                                    Editar
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(prod.id)}
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
            <ConfirmModal
                isOpen={modalOpen}
                title="Eliminar producto"
                message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setModalOpen(false)}
            />
        </div>
    );
}

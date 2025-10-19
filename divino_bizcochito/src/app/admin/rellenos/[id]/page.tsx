"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from "@/app/components/BackButton/BackButton";

interface Producto {
    id?: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria_id?: string;
    disponible: boolean;
}

export default function EditarProductoPage() {
    const { id } = useParams();
    const router = useRouter();

    const [producto, setProducto] = useState<Producto>({
        nombre: "",
        descripcion: "",
        precio: 0,
        imagen: "",
        categoria_id: "",
        disponible: true,
    });

    const [categorias, setCategorias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const res = await fetch(`/api/producto?id=${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al obtener producto");
                setProducto(data[0]);

                const catRes = await fetch("/api/categoria");
                const catData = await catRes.json();
                if (catRes.ok) setCategorias(catData);
            } catch (error) {
                console.error("❌ Error al cargar producto:", error);
                alert("No se pudo cargar el producto");
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setProducto((prev) => ({
            ...prev,
            [target.name]: target.type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/producto", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...producto, id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al actualizar producto");

            alert("✅ Producto actualizado correctamente");
            router.push("/admin/productos");
        } catch (error) {
            console.error("❌ Error al actualizar producto:", error);
            alert("❌ No se pudo actualizar el producto");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-600">Cargando producto...</p>;

    return (
        <ProtectedRoute role="admin">
            <div className="max-w-xl mx-auto mt-10 bg-[#EDE2D3] border border-[#530708] rounded-xl p-6 shadow-md">
                <BackButton label="Volver a la lista" />
                <h1 className="text-2xl font-bold text-[#530708] text-center mt-4 mb-6">
                    Editar Producto
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-[#530708] font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={producto.nombre}
                            onChange={handleChange}
                            required
                            className="w-full border border-[#530708] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-[#530708] font-medium mb-1">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={producto.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-[#530708] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-[#530708] font-medium mb-1">Precio</label>
                        <input
                            type="number"
                            name="precio"
                            value={producto.precio}
                            onChange={handleChange}
                            min="0"
                            step="100"
                            className="w-full border border-[#530708] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-[#530708] font-medium mb-1">Categoría</label>
                        <select
                            name="categoria_id"
                            value={producto.categoria_id || ""}
                            onChange={handleChange}
                            className="w-full border border-[#530708] rounded-lg px-3 py-2 bg-white text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="block text-[#530708] font-medium mb-1">URL de Imagen</label>
                        <input
                            type="text"
                            name="imagen"
                            value={producto.imagen}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full border border-[#530708] rounded-lg px-3 py-2 text-[#530708] bg-white focus:ring-2 focus:ring-[#C72C2F]"
                        />
                    </div>

                    {/* Disponible */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="disponible"
                            name="disponible"
                            checked={producto.disponible}
                            onChange={handleChange}
                            className="accent-[#C72C2F] w-4 h-4"
                        />
                        <label htmlFor="disponible" className="text-[#530708] font-medium">
                            Disponible para la venta
                        </label>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold py-2 rounded-lg mt-4 transition"
                    >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </ProtectedRoute>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/protectedRoute/ProtectedRoute";
import BackButton from "@/app/components/BackButton/BackButton";

interface Producto {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria_id?: string;
  topping_id?: string;
  relleno_id?: string;
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
    topping_id: "",
    relleno_id: "",
    disponible: true,
  });

  const [categorias, setCategorias] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [rellenos, setRellenos] = useState<any[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Cargar datos del producto + listas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, topRes, relRes] = await Promise.all([
          fetch(`/api/producto?id=${id}`),
          fetch("/api/categorias"),
          fetch("/api/toppings"),
          fetch("/api/relleno"),
        ]);

        const [prodData, catData, topData, relData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
          topRes.json(),
          relRes.json(),
        ]);

        if (prodRes.ok) {
          setProducto(prodData[0]);
          setPreview(prodData[0]?.imagen || "");
        }

        if (catRes.ok) setCategorias(catData);
        if (topRes.ok) setToppings(topData);
        if (relRes.ok) setRellenos(relData);
      } catch (error) {
        console.error("❌ Error al cargar producto:", error);
        alert("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🧾 Actualizar campos
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

  // 🖼️ Cambiar imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setProducto((prev) => ({ ...prev, imagen: file.name }));
  };

  // 💾 Guardar cambios
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

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando producto...</p>;

  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <BackButton label="Volver a la lista" />

          <h1 className="text-3xl font-bold text-[#C72C2F] text-center mb-8">
            Editar producto
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
          >
            {/* Imagen */}
            <div className="flex flex-col items-center justify-center bg-[#C72C2F] text-white rounded-2xl h-[380px] relative overflow-hidden">
              {preview ? (
                <div className="relative w-full h-full">
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <label
                    htmlFor="imagen"
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-14 w-14 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="font-medium">Cambiar imagen</p>
                  </label>
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <>
                  <label
                    htmlFor="imagen"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-center font-medium">
                      Subir foto del producto final
                    </p>
                  </label>
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Campos */}
            <div className="flex flex-col gap-5">
              {/* Nombre */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={producto.nombre}
                  onChange={handleChange}
                  placeholder="Ingresar nombre del producto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={producto.descripcion}
                  onChange={handleChange}
                  placeholder="Ingresar descripción del producto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                />
              </div>

              {/* Topping */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Topping
                </label>
                <select
                  name="topping_id"
                  value={producto.topping_id || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                >
                  <option value="">Seleccionar topping</option>
                  {toppings.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Relleno */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Relleno
                </label>
                <select
                  name="relleno_id"
                  value={producto.relleno_id || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                >
                  <option value="">Seleccionar relleno</option>
                  {rellenos.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Categoría
                </label>
                <select
                  name="categoria_id"
                  value={producto.categoria_id || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-[#530708] font-medium mb-1">
                  Precio c/u
                </label>
                <input
                  type="number"
                  name="precio"
                  value={producto.precio}
                  onChange={handleChange}
                  placeholder="$0"
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-[#530708] focus:ring-2 focus:ring-[#C72C2F]"
                />
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-6 py-2 rounded-lg transition"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

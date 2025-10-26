"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Carousel from "./components/Carousel/Carousel";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/app/components/ProductCard/ProductCard";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "./components/ui/ConfirmModal";
import AcercaDe from "./components/AcercaDe/AcercaDe";


interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function Home() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Array<Producto>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);

        // 🟢 Consulta a Supabase: ordena por ventas desc y limita a 4
        const { data, error } = await supabase
          .from("Producto")
          .select("*")
          .order("ventas", { ascending: false })
          .limit(4);

        if (error) throw error;

        // 🔒 Aseguramos que solo sean 4 elementos
        const top4 = Array.isArray(data) ? data.slice(0, 4) : [];

        setProductos(top4);
      } catch (err) {
        console.error("❌ Error al traer productos:", err);
        setProductos([]); // limpia si hay error
      } finally {
        setLoading(false);
      }
    };
    const fetchProductosCategoria = async () => {
      const responseCategorias = await fetch("/api/categorias");

      const dataCategorias = await responseCategorias.json();
      setCategorias(dataCategorias);
    };

    fetchProductosCategoria();
    fetchProductos();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/${id}`);
  };
  const handleViewProduct = (id: string) => {
    router.push(`/views/producto/${id}`);

  };

  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      const res = await fetch(`/api/productos?id=${selectedProductId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar producto");

      showAlert("✅ Producto eliminado correctamente", "success");

      setProductos((prev) => prev.filter((p) => p.id !== selectedProductId));
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      showAlert("❌ No se pudo eliminar el producto", "error");
    } finally {
      setModalOpen(false);
      setDeleteProductId(null);
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  return (
    <main className="p-0 m-0">
      <Carousel />
      <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8">
        Productos destacados
      </h1>
      <div className="grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-2 
    lg:grid-cols-4 
    gap-8 
    justify-center 
    place-items-center 
    max-w-7xl 
    mx-auto
    px-4">
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            nombre={producto.nombre}
            categoriaId={categorias.map(cat => cat.id === producto.categoriaId ? cat.nombre : '').find(name => name !== undefined) || 'Sin categoría'}
            precio={producto.precio}
            descripcion={producto.descripcion}
            imagen={producto.imagen}
            onEdit={() => handleEdit(producto.id)}
            onDelete={() => handleDeleteClick(producto.id)}
            onViewRecipe={() => handleViewProduct(producto.id)}
          />
        ))}
      </div>
      <div>
        <AcercaDe />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8 mb-8"> Recetas populares</h1>
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
    </main>
  );
}

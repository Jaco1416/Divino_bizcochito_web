"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/app/components/ProductCard/ProductCard";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

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

function CatalogoPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductosCategoria = async () => {
      const response = await fetch("/api/productos");
      const responseCategorias = await fetch("/api/categorias");
      const data = await response.json();
      setProductos(data);

      const dataCategorias = await responseCategorias.json();
      setCategorias(dataCategorias);
    };


    fetchProductosCategoria();
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

  return (
    <div className="px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-red-700">
        Catálogo de Productos
      </h1>

      {/* 🧱 Grid de productos */}
      <div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    md:grid-cols-2 
    lg:grid-cols-4 
    gap-8 
    justify-center 
    place-items-center 
    max-w-7xl 
    mx-auto
    px-4
  ">
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

export default CatalogoPage;

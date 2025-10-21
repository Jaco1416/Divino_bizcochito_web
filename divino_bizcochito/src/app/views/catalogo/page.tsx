"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/app/components/ProductCard/ProductCard";
import { useAlert } from "@/app/hooks/useAlert";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

function CatalogoPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setDeleteProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      const response = await fetch("/api/productos");
      const data = await response.json();
      setProductos(data);
    };

    fetchProductos();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/${id}`);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            nombre={producto.nombre}
            categoria={producto.categoria}
            precio={producto.precio}
            descripcion={producto.descripcion}
            imagen={producto.imagen}
            onEdit={() => handleEdit(producto.id)}
            onDelete={() => handleDeleteClick(producto.id)}
            onViewRecipe={() => handleEdit(producto.id)}
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

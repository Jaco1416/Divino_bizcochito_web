"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import RecipeDetail from '@/app/components/RecipeDetail/RecipeDetail'

function DetalleRecipePage() {
  const { id } = useParams(); // obtiene el id desde la URL
  const router = useRouter();
  const { user, perfil } = useAuth();
  const [receta, setReceta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // 🔹 Obtener receta por ID
  const fetchReceta = async () => {
    try {
      const res = await fetch(`/api/recetas/${id}`);
      if (!res.ok) throw new Error("Error al obtener la receta");
      const data = await res.json();
      setReceta(data);
    } catch (error) {
      console.error("❌ Error al cargar la receta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReceta();
    }
  }, [id]);

  useEffect(() => {
    if (perfil && receta) {
      setIsOwner(receta.autorId === perfil.id);
    }
  }, [perfil, receta]);

  useEffect(() => {
    if (perfil) {
      setIsAdmin(perfil.rol === 'admin');
    }
  }, [perfil]);

  // 🔹 Acción de publicar
  const handlePublicar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}/estado`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevoEstado: "publicada" })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al publicar receta");
      }
      
      alert("✅ Receta publicada correctamente");
      router.push("/admin/recetas");
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo publicar la receta");
    }
  };

  // 🔹 Acción de rechazar
  const handleRechazar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}/estado`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevoEstado: "rechazada" })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al rechazar receta");
      }
      
      alert("❌ Receta rechazada correctamente");
      router.push("/admin/recetas");
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo rechazar la receta");
    }
  };

  // 🔹 Acción de editar
  const handleEditar = (id: number) => {
    router.push(`/views/recetas/editar/${id}`);
  };

  // 🔹 Acción de eliminar
  const handleEliminar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar receta");
      }
      
      alert("✅ Receta eliminada correctamente");
      router.push("/views/recetas");
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo eliminar la receta");
    }
  };

  // 🔹 Acción de guardar cambios
  const handleGuardar = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/recetas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar cambios");
      }

      alert("✅ Cambios guardados correctamente");
      // Recargar la receta actualizada
      fetchReceta();
    } catch (error) {
      console.error(error);
      alert("❌ No se pudieron guardar los cambios");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando receta...</p>
      </div>
    );
  }

  if (!receta) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600">No se pudo cargar la receta</p>
      </div>
    );
  }

  return (
    <div>
      <RecipeDetail 
        receta={receta} 
        isAdmin={isAdmin}
        isOwner={isOwner}
        onPublicar={handlePublicar} 
        onRechazar={handleRechazar}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onGuardar={handleGuardar}
      />
    </div>
  )
}

export default DetalleRecipePage
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
  const [isAdmin, setIsAdmin] = useState(false); // puedes cambiarlo según el rol real del usuario

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
    if (id) fetchReceta();
    setIsAdmin(perfil?.rol === 'admin');
    // Aquí podrías cargar el rol real del usuario desde sesión o API/ 🔹 cambia a false si no es admin

  }, [id]);

  // 🔹 Acción de publicar
  const handlePublicar = async (id: number) => {
    try {
      const res = await fetch(`/api/recetas/${id}/publicar`, { method: "PUT" });
      if (!res.ok) throw new Error("Error al publicar receta");
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
      const res = await fetch(`/api/recetas/${id}/rechazar`, { method: "PUT" });
      if (!res.ok) throw new Error("Error al rechazar receta");
      alert("❌ Receta rechazada correctamente");
      router.push("/admin/recetas");
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo rechazar la receta");
    }
  };

  return (
    <div>
      <RecipeDetail receta={receta} isAdmin={isAdmin} onPublicar={handlePublicar} onRechazar={handleRechazar} />
    </div>
  )
}

export default DetalleRecipePage
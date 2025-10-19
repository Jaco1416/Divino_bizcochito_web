"use client";
import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/ProtectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function usuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch("/api/usuarios");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
        setUsuarios(data);
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);


  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Usuarios page</div>
    </ProtectedRoute>
  )
}

export default usuariosPage
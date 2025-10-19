"use client";

import React from 'react'
import PerfilCard from '@/app/components/PerfilCard/PerfilCard';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/app/components/protectedRoute/ProtectedRoute';
import AdminOptions from '@/app/components/AdminOptions/AdminOptions';

function PerfilPage() {
    const { user, perfil, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-600 text-lg">Cargando perfil...</p>
            </div>
        );
    }


    return (
        <div>
            <ProtectedRoute>
                <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 bg-[#F9F4EF]">
                    {/* Si el rol es administrador, mostrar panel */}
                    <PerfilCard
                            nombre={perfil?.nombre || "Juan Pérez"}
                            rol={perfil?.rol || "Cliente"}
                            email={user?.email || "juan.perez@example.com"}
                            telefono={perfil?.telefono || "+56 9 1234 5678"}
                            imagen={perfil?.imagen || "/path/to/image.jpg"}
                            onEditar={() => console.log("Editar perfil")}
                        />
                    {perfil?.rol?.toLowerCase() === "admin" ? (
                        <AdminOptions
                            onSelect={(option) => console.log("Seleccionado:", option)}
                        />
                    ) : (
                        <p>Perfil de usuario</p>
                    )}
                </div>
            </ProtectedRoute>
        </div>
    )
}

export default PerfilPage
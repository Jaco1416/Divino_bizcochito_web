"use client";

import React, { use, useEffect, useState } from 'react'
import RecetasCard from '@/app/components/RecetasCard/RecetasCard'

interface Receta {
    id: string;
    titulo: string;
    categoria: string;
    autorId: string;
    descripcion: string;
    imagen: string;
}

function RecetasPage() {

    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecetas = async () => {
        try {
            const res = await fetch("/api/recetas");
            if (!res.ok) throw new Error("Error al obtener recetas");

            const data = await res.json();
            setRecetas(data);
        } catch (err) {
            console.error("❌ Error al traer recetas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecetas();
    }, []);


    return (
        <div>
            {recetas.map((r) => (
                <RecetasCard
                    key={r.id}
                    id={r.id}
                    titulo={r.titulo}
                    categoria={r.categoria}
                    autorId={r.autorId}
                    descripcion={r.descripcion}
                    imagen={r.imagen}
                />
            ))}
        </div>
    )
}

export default RecetasPage
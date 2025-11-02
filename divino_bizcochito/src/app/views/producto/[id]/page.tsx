"use client";

import { use, useEffect, useState } from "react";
import DetalleProductoCard from "@/app/components/ProductDetail/ProductDetail";

interface Categoria {
    id: number;
    nombre: string;
}

interface Opcion {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string;
    precio: number;
    categoriaId: number;
}

export default function DetalleProducto({ params }: { params: Promise<{ id: string }> }) {

    const { id } = use(params);


    const [producto, setProducto] = useState<Producto | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [rellenos, setRellenos] = useState<Opcion[]>([]);
    const [toppings, setToppings] = useState<Opcion[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔹 useEffect para cargar datos
    useEffect(() => {

        const fetchData = async () => {
            try {
                if (!id) return;

                const [productoRes, categoriasRes, rellenosRes, toppingsRes] =
                    await Promise.all([
                        fetch(`/api/productos?id=${id}`),
                        fetch(`/api/categorias`),
                        fetch(`/api/relleno`),
                        fetch(`/api/toppings`),
                    ]);

                const productoData = await productoRes.json();
                const categoriasData = await categoriasRes.json();
                const rellenosData = await rellenosRes.json();
                const toppingsData = await toppingsRes.json();

                setProducto(productoData);
                setCategorias(categoriasData);
                setRellenos(rellenosData);
                setToppings(toppingsData);
                console.log(productoData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, []);

    if (loading) return <p className="text-center mt-10">Cargando...</p>;
    if (!producto) return <p className="text-center mt-10">Producto no encontrado</p>;


    return (
        <div className="p-6">
            <DetalleProductoCard
                producto={producto}
                categorias={categorias}
                rellenos={rellenos}
                toppings={toppings}
            />
        </div>
    );
}

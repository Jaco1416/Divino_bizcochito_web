"use client";

import Image from "next/image";
import { useState } from "react";

interface RecipeDetailProps {
  receta: {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    autor: string;
    autorAvatar?: string;
    imagenUrl: string;
    ingredientes: string;
    pasos: string;
  };
  isAdmin?: boolean;
  onPublicar?: (id: number) => void;
  onRechazar?: (id: number) => void;
}

export default function RecipeDetail({
  receta,
  isAdmin = false,
  onPublicar,
  onRechazar,
}: RecipeDetailProps) {
  const [loading, setLoading] = useState(false);

  const handlePublicar = async () => {
    setLoading(true);
    await onPublicar?.(receta.id);
    setLoading(false);
  };

  const handleRechazar = async () => {
    setLoading(true);
    await onRechazar?.(receta.id);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10 px-4">
      {/* Título */}
      <h1 className="text-3xl font-bold text-[#530708] mb-6 text-center">
        {receta.titulo}
      </h1>

      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row items-start gap-8 max-w-5xl w-full bg-[#fefaf2] p-6 rounded-2xl shadow-lg border border-[#8B3A3A]">
        {/* Imagen */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          <Image
            src={receta.imagenUrl}
            alt={receta.titulo}
            width={500}
            height={400}
            className="rounded-xl object-cover w-full h-[350px] border border-[#8B3A3A]"
          />

          {/* Categoría */}
          <p className="mt-4 text-lg text-[#530708] font-semibold">
            Categoría:{" "}
            <span className="text-[#C72C2F] font-bold">
              {receta.categoria}
            </span>
          </p>

          {/* Autor */}
          <div className="mt-3 flex items-center gap-3">
            {receta.autorAvatar && (
              <Image
                src={receta.autorAvatar}
                alt={receta.autor}
                width={40}
                height={40}
                className="rounded-full border border-[#8B3A3A]"
              />
            )}
            <p className="text-lg text-[#530708] font-semibold">
              Autor:{" "}
              <span className="text-[#C72C2F] font-bold">{receta.autor}</span>
            </p>
          </div>
        </div>

        {/* Descripción, ingredientes y pasos */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-[#530708] font-semibold mb-1">
              Descripción
            </label>
            <p className="p-3 bg-[#d7b6b6] rounded-md text-[#2c0000]">
              {receta.descripcion || "Sin descripción"}
            </p>
          </div>

          <div>
            <label className="block text-[#530708] font-semibold mb-1">
              Ingredientes
            </label>
            <textarea
              className="w-full bg-[#d7b6b6] text-[#2c0000] rounded-md p-3 resize-none"
              rows={6}
              value={receta.ingredientes}
              readOnly
            />
          </div>

          <div>
            <label className="block text-[#530708] font-semibold mb-1">
              Paso a paso
            </label>
            <textarea
              className="w-full bg-[#d7b6b6] text-[#2c0000] rounded-md p-3 resize-none"
              rows={6}
              value={receta.pasos}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 flex gap-4">
        {/* Mostrar ambos si es admin */}
        {isAdmin ? (
          <>
            <button
              onClick={handlePublicar}
              disabled={loading}
              className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded transition disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Publicar"}
            </button>
            <button
              onClick={handleRechazar}
              disabled={loading}
              className="bg-[#530708] hover:bg-[#3D0506] text-white font-semibold px-5 py-2 rounded transition disabled:opacity-60"
            >
              {loading ? "Procesando..." : "Rechazar"}
            </button>
          </>
        ) : (
          // Solo publicar si no es admin
          <button
            onClick={handlePublicar}
            disabled={loading}
            className="bg-[#C72C2F] hover:bg-[#A92225] text-white font-semibold px-5 py-2 rounded transition disabled:opacity-60"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        )}
      </div>
    </div>
  );
}

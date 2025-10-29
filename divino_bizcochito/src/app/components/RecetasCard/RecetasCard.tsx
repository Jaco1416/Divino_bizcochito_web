"use client";

import React from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Image from "next/image";

interface RecetasCardProps {
  id: string;
  titulo: string;
  categoria: string;
  autorId: string;
  descripcion: string;
  imagen: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function RecetasCard({
  id,
  titulo,
  categoria,
  autorId,
  descripcion,
  imagen,
  onEdit,
  onDelete,
  onView,
}: RecetasCardProps) {
  return (
    <div className="bg-[#f8f2ea] border border-[#e4d8ca] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden w-[250px] flex flex-col">
      {/* Imagen */}
      <div className="h-40 w-full overflow-hidden">
        <Image
          src={imagen}
          alt={titulo}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-[#C72C2F] font-semibold text-lg">{titulo}</h3>
          <div className="flex justify-between text-sm text-gray-700 mt-1">
            <span>
              <strong>Autor:</strong> {autorId}
            </span>
            <span>
              <strong>Categoría:</strong> {categoria}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-2">{descripcion}</p>
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(id)}
              className="p-2 rounded-md hover:bg-[#e3d8ce] text-[#C72C2F] transition-colors"
              title="Editar"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete?.(id)}
              className="p-2 rounded-md hover:bg-[#e3d8ce] text-[#C72C2F] transition-colors"
              title="Eliminar"
            >
              <FaTrashAlt />
            </button>
          </div>

          <button
            onClick={() => onView?.(id)}
            className="bg-[#C72C2F] text-white px-4 py-2 rounded-md hover:bg-[#a02425] transition-colors"
          >
            Ver receta
          </button>
        </div>
      </div>
    </div>
  );
}

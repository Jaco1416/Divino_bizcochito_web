"use client";

import { FaPen, FaTrashAlt } from "react-icons/fa";

interface ProductCardProps {
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewRecipe?: () => void;
}

export default function ProductCard({
  nombre,
  categoria,
  precio,
  descripcion,
  imagen,
  onEdit,
  onDelete,
  onViewRecipe,
}: ProductCardProps) {
  return (
    <div className="bg-[#f7efe3] border border-[#e0d3c0] rounded-lg shadow-sm overflow-hidden w-72 flex flex-col">
      {/* Imagen */}
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-44 object-cover"
      />

      {/* Contenido */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Título y categoría */}
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-red-600 font-semibold text-base">{nombre}</h2>
            <span className="text-sm text-gray-800 font-semibold">
              Categoría: <span className="font-bold">{categoria}</span>
            </span>
          </div>

          {/* Precio */}
          <p className="font-bold text-lg mb-1">
            ${precio.toLocaleString("es-CL")}
          </p>

          {/* Descripción */}
          <p className="text-sm text-gray-700 leading-snug">
            {descripcion}
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
              title="Editar"
            >
              <FaPen size={14} />
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
              title="Eliminar"
            >
              <FaTrashAlt size={14} />
            </button>
          </div>

          <button
            onClick={onViewRecipe}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-md"
          >
            Ver receta
          </button>
        </div>
      </div>
    </div>
  );
}

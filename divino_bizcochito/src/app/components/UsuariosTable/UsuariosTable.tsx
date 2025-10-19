"use client";

interface UsuariosTableProps {
  usuarios: any[];
}

export default function UsuariosTable({ usuarios }: UsuariosTableProps) {
  if (usuarios.length === 0) {
    return (
      <p className="text-center text-gray-600">
        No hay usuarios registrados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#EDE2D3] border border-[#530708] rounded-xl shadow-md p-4">
      <table className="min-w-full text-left text-sm text-[#530708]">
        <thead className="bg-[#C72C2F] text-white">
          <tr>
            <th className="px-4 py-2">Correo</th>
            <th className="px-4 py-2">Creado</th>
            <th className="px-4 py-2">Confirmado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr
              key={user.id}
              className="border-t border-[#530708]/30 hover:bg-[#F9ECE2]"
            >
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                {new Date(user.created_at).toLocaleDateString("es-CL")}
              </td>
              <td className="px-4 py-2">
                {user.email_confirmed_at ? "✅ Sí" : "❌ No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/views/login"); // o "/login" si está fuera de /views
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white">
      <h1 className="text-3xl font-bold text-rose-700 mb-8">
        Bienvenido a Divino Bizcochito 🍰
      </h1>

      <button
        onClick={handleLogin}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
      >
        Iniciar sesión
      </button>
    </main>
  );
}

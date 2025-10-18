"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Carousel from "./components/Carousel/Carousel";

export default function Home() {
  const router = useRouter();
   const { user, perfil, loading, handleLogout } = useAuth();

  const handleLogin = () => {
    router.push("/views/login"); // o "/login" si está fuera de /views
  };

  return (
    <main className="p-0 m-0">
      <Carousel />
      <h1 className="text-4xl font-bold text-[#C72C2F] text-center mt-8">
        Productos destacados
      </h1>
      <h1>
       <p>Bienvenido: {perfil?.nombre}</p>
       <p>Perfil: {perfil?.rol}</p>
      </h1>
    </main>
  );
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Perfil {
  id: string;
  nombre: string;
  rol: "admin" | "cliente";
  imagen: string;
}

interface AuthContextType {
  user: any | null;
  perfil: Perfil | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  handleLogout: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const { data: perfilData, error } = await supabase
          .from("Perfiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) console.error("Error al obtener perfil:", error);
        else console.log("Perfil obtenido:", perfilData);

        setPerfil(perfilData || null);
      } else {
        setUser(null);
        setPerfil(null);
      }

      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from("Perfiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then((result) => {
            console.log("Resultado crudo del perfil:", result);
            const { data, error } = result;

            if (error) {
              console.error("Error al actualizar perfil:", error);
            } else {
              console.log("Perfil actualizado:", data);
            }

            setPerfil(data || null);
          });
      } else {
        setUser(null);
        setPerfil(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
    router.push("/views/login"); // redirige al login (ajústalo si usas /vistas/login)
  };

  return (
    <AuthContext.Provider value={{ user, perfil, loading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

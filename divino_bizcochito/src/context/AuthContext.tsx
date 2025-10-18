"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // obtiene el perfil desde tu tabla
        const { data: perfilData } = await supabase
          .from("Perfiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setPerfil(perfilData || null);
      } else {
        setUser(null);
        setPerfil(null);
      }

      setLoading(false);
    };

    fetchUser();

    // suscripción a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from("Perfiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setPerfil(data || null));
      } else {
        setUser(null);
        setPerfil(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

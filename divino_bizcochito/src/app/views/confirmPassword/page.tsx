"use client";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAlert } from "@/app/hooks/useAlert";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmPasswordContent() {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1️⃣ Activar la sesión con el token de recuperación
  useEffect(() => {
    async function handleRecoverySession() {
      if (!token || type !== "recovery") return;

      const { error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      if (error) {
        console.error(error);
        showAlert("No pudimos validar tu enlace de recuperación.", "error");
      }
    }

    handleRecoverySession();
  }, [token, type, showAlert]);

  // 2️⃣ Actualizar contraseña
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showAlert("La contraseña debe tener al menos 8 caracteres.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Las contraseñas no coinciden.", "warning");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      showAlert("❌ No pudimos actualizar la contraseña.", "error");
      router.push("/views/login");
    } else {
      showAlert("✅ Contraseña actualizada correctamente.", "success");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f1ed] px-4">
      <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-full max-w-[420px] text-white">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-center opacity-90 mb-6">
          Ingresa una nueva contraseña para tu cuenta.
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Contraseña nueva"
              className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repetir contraseña"
              className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/70"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md shadow-lg hover:bg-red-500 hover:text-white active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ConfirmPasswordView() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8f1ed] px-4">
          <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-full max-w-[420px] text-white text-center">
            Cargando...
          </div>
        </div>
      }
    >
      <ConfirmPasswordContent />
    </Suspense>
  );
}

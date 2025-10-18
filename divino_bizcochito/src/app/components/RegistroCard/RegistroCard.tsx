"use client";
import { useState } from "react";

export default function Registro() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // lógica de registro
    };

    return (
        <div className="flex items-center justify-center  py-20">
            <div className="bg-[#C72C2F] p-10 rounded-2xl shadow-xl w-[400px]">
                <h1 className="text-2xl font-semibold text-center text-white mb-8">
                    Registro
                </h1>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-white/90 text-sm mb-1">Usuario</label>
                        <input
                            type="text"
                            placeholder="Ingresar usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    <div>
                        <label className="block text-white/90 text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="EJ: 123456789As+"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    <div>
                        <label className="block text-white/90 text-sm mb-1">Confirmar contraseña</label>
                        <input
                            type="password"
                            placeholder="Ingresar nuevamente contraseña..."
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    <div>
                        <label className="block text-white/90 text-sm mb-1">Número de teléfono</label>
                        <input
                            type="tel"
                            placeholder="EJ: +56 9 8547 1673"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    <div>
                        <label className="block text-white/90 text-sm mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="EJ: divinobizcochito@gmail.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder:text-gray-400
                         border border-white/50 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-white/70"
                        />
                    </div>

                    <p className="text-sm text-white/90 -mt-1">
                        ¿Ya tienes cuenta?{" "}
                        <a href="/views/login" className="underline text-white hover:text-amber-950">
                            Inicia sesión.
                        </a>
                    </p>

                    <button
                        type="submit"
                        className="w-full bg-white text-[#C72C2F] font-semibold py-3 rounded-md
                       shadow-lg hover:bg-red-500 hover:text-white  active:scale-[0.99] transition"
                    >
                        Registrarte
                    </button>
                </form>
            </div>
        </div>
    );
}

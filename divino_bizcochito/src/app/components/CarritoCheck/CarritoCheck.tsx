"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // tu cliente configurado
import { useAlert } from "@/app/hooks/useAlert";

const formatTelefono = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)} ${digits.slice(4)}`.trim();
};

interface Pedido {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    categoriaId: number;
    toppingId: number;
    rellenoId: number;
    cantidad: number;
    mensaje: string;
    total: number;
}

interface Opcion {
    id: number;
    nombre: string;
}

export default function CarritoCheck() {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [carrito, setCarrito] = useState<Pedido[]>([]);
    const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "envio">("retiro");
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [correo, setCorreo] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [telefono, setTelefono] = useState("");
    const [rellenos, setRellenos] = useState<Opcion[]>([]);
    const [toppings, setToppings] = useState<Opcion[]>([]);
    const [slots, setSlots] = useState<{ fecha: string; carga: number; restante: number }[]>([]);
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
    const [superaMaximo, setSuperaMaximo] = useState(false);

    const costoEnvio = 2000;

    useEffect(() => {
        try {

            const fetchData = async () => {
                try {
                    fetch(`/api/relleno`).then(async (res) => {
                        const rellenosData = await res.json();
                        setRellenos(rellenosData);
                    });
                    fetch(`/api/toppings`).then(async (res) => {
                        const toppingsData = await res.json();
                        setToppings(toppingsData);
                    });
                } catch (error) {
                    console.error("Error al cargar los datos:", error);
                }
            };


            fetchData();
            try {
                // Leer el carrito guardado en localStorage
                const stored = localStorage.getItem("carrito");

                if (stored) {
                    const pedidos = JSON.parse(stored);
                    setCarrito(pedidos);
                    console.log("🛒 Carrito cargado:", pedidos);
                } else {
                    console.warn("⚠️ No se encontró ningún carrito en localStorage");
                }
            } catch (error) {
                console.error("❌ Error al leer el carrito:", error);
            }
        } catch (error) {
            console.error("Error al cargar el carrito desde localStorage:", error);
        }

    }, []);

    // Recalcular disponibilidad cuando cambia el carrito
    useEffect(() => {
        const fetchDisponibilidad = async () => {
            if (!carrito.length) {
                setSlots([]);
                setFechaEntrega("");
                return;
            }

            setLoadingDisponibilidad(true);
            const totalProductos = carrito.reduce(
                (acc, item) => acc + (item.cantidad ?? 0),
                0
            );

            try {
                const res = await fetch(`/api/configPedidos?items=${totalProductos}`);
                if (!res.ok) throw new Error("No se pudo cargar la disponibilidad");
                const data = await res.json();

                const disponibles =
                    data.slots?.filter(
                        (s: any) => Number(s.restante) >= totalProductos
                    ) ?? [];

                setSlots(disponibles);
                setSuperaMaximo(Boolean(data.superaMaximo));

                if (disponibles.length) {
                    setFechaEntrega(disponibles[0].fecha);
                } else {
                    setFechaEntrega("");
                }
            } catch (error) {
                console.error("Error al cargar disponibilidad:", error);
                showAlert("No se pudo cargar la disponibilidad de fechas.", "warning");
                setSlots([]);
                setFechaEntrega("");
            } finally {
                setLoadingDisponibilidad(false);
            }
        };

        fetchDisponibilidad();
    }, [carrito, showAlert]);

    const handlePay = async () => {
        if (tipoEntrega === "envio") {
            if (!nombre.trim() || !direccion.trim() || !correo.trim() || !telefono.trim()) {
                showAlert("Por favor completa nombre, dirección, correo y teléfono para envíos.", "warning");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                showAlert("Ingresa un correo electrónico válido.", "warning");
                return;
            }

            if (!/^\d{4}\s\d{4}$/.test(telefono)) {
                showAlert('El teléfono debe tener el formato "8888 8888".', "warning");
                return;
            }
        }

        if (superaMaximo) {
            showAlert("El pedido supera el máximo permitido de productos.", "warning");
            return;
        }

        if (!fechaEntrega) {
            showAlert("Selecciona una fecha de entrega disponible.", "warning");
            return;
        }

        try {
            console.log("Procesando pago...");

            const carritoRaw = localStorage.getItem("carrito");
            if (!carritoRaw) {
                showAlert("Error: carrito vacío o inválido.", "error");
                return;
            }

            const carritoLocal = JSON.parse(carritoRaw);
            console.log("🧩 Carrito obtenido de localStorage:", carritoLocal);

            const datosEnvioPayload = carritoLocal.datosEnvio
                ? { ...carritoLocal.datosEnvio, fechaEntrega }
                : {
                      nombre,
                      direccion,
                      correo,
                      telefono: telefono ? `+56 9 ${telefono}` : "",
                      comentarios,
                      fechaEntrega,
                  };

            // 2️⃣ Armar los datos a guardar en Supabase
            const carritoData = {
                perfilid: user.id || null, // ⚠️ Asegúrate de tener el id del perfil, no del auth.user
                tipoentrega: carritoLocal.tipoEntrega || tipoEntrega || "retiro",
                datosenvio: datosEnvioPayload,
                items: carritoLocal.items || carritoLocal, // Por si tu estructura es distinta
            };

            // 3️⃣ Guardar carrito en Supabase
            const { data: nuevoCarrito, error: errCarrito } = await supabase
                .from("Carrito")
                .insert([carritoData])
                .select()
                .single();

            if (errCarrito) {
                console.error("❌ Error guardando carrito:", errCarrito);
                showAlert("No se pudo guardar el carrito.", "error");
                return;
            }

            // 4️⃣ Generar sessionId único para Webpay
            const sessionId = `${nuevoCarrito.id}`;

            // 5️⃣ Crear transacción en Webpay
            const response = await fetch("/api/webpay/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: totalFinal,
                    sessionId,
                    returnUrl: `${window.location.origin}/api/webpay/commit`,
                }),
            });

            const data = await response.json();

            if (!data.url || !data.token) {
                console.error("Error al iniciar Webpay:", data);
                showAlert("No se pudo iniciar el pago. Inténtalo más tarde.", "error");
                return;
            }

            // 6️⃣ Redirigir al portal Webpay
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.url;

            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "token_ws";
            input.value = data.token;
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error("Error procesando el pago:", error);
            showAlert("Ocurrió un error al procesar el pago.", "error");
        }
    };


    const eliminarProducto = (id: number) => {
        const nuevoCarrito = carrito.filter((item) => item.id !== id);
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    };

    const totalCarrito = carrito.reduce((acc, item) => acc + item.total, 0);
    const totalFinal =
        tipoEntrega === "envio" ? totalCarrito + costoEnvio : totalCarrito;
    const isPayDisabled =
        carrito.length === 0 ||
        loadingDisponibilidad ||
        superaMaximo ||
        (!fechaEntrega && slots.length > 0);

    const allowedDates = new Set(slots.map((s) => s.fecha));
    const minFecha = slots.length ? slots[0].fecha : "";
    const maxFecha = slots.length ? slots[slots.length - 1].fecha : "";

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Tabla de productos */}
            <table className="w-full border border-gray-600 rounded-lg overflow-hidden shadow-sm mb-8">
                <thead>
                    <tr className="bg-red-800 text-white text-left">
                        <th className="p-3 border-r border-red-700">Producto</th>
                        <th className="p-3 text-center border-r border-red-700">Cantidad</th>
                        <th className="p-3 text-center border-r border-red-700">Precio</th>
                        <th className="p-3 text-center border-r border-red-700">Modificado</th>
                        <th className="p-3 text-center">Eliminar</th>
                    </tr>
                </thead>
                <tbody className="bg-white-200">
                    {carrito.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-gray-600">
                                Tu carrito está vacío 🛒
                            </td>
                        </tr>
                    ) : (
                        carrito.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`${index % 2 === 0 ? "bg-gray-250" : "bg-white"
                                    } border-b border-gray-200 hover:bg-gray-100 transition-colors`}
                            >
                                {/* Producto */}
                                <td className="p-4 flex items-center gap-3 border-r">
                                    <img
                                        src={item.imagen}
                                        alt={item.nombre}
                                        className="w-16 h-16 object-cover rounded-md border border-gray-300"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.nombre}</p>
                                        {item.mensaje && (
                                            <p className="text-sm text-gray-600 italic">“{item.mensaje}”</p>
                                        )}
                                    </div>
                                </td>

                                {/* Cantidad */}
                                <td className="p-4 text-center font-medium text-gray-700 border-r">
                                    {item.cantidad}
                                </td>

                                {/* Precio */}
                                <td className="p-4 text-center font-medium text-gray-700 border-r">
                                    ${item.precio.toLocaleString("es-CL")}
                                </td>

                                {/* Modificado */}
                                <td className="p-4 text-center text-gray-700 border-r">
                                    {(() => {
                                        const topping = toppings.find((t) => t.id === item.toppingId);
                                        const relleno = rellenos.find((r) => r.id === item.rellenoId);

                                        return (
                                            <>
                                                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {topping ? topping.nombre : `Topping ${item.toppingId}`}
                                                </span>{" "}
                                                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {relleno ? relleno.nombre : `Relleno ${item.rellenoId}`}
                                                </span>
                                            </>
                                        );
                                    })()}
                                </td>

                                {/* Eliminar */}
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => eliminarProducto(item.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>


            {/* Selector tipo de entrega */}
            <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="entrega"
                        value="retiro"
                        checked={tipoEntrega === "retiro"}
                        onChange={() => setTipoEntrega("retiro")}
                        className="accent-red-600 w-5 h-5"
                    />
                    <span className="font-medium text-gray-700">🏪 Retiro en tienda</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="entrega"
                        value="envio"
                        checked={tipoEntrega === "envio"}
                        onChange={() => setTipoEntrega("envio")}
                        className="accent-red-600 w-5 h-5"
                    />
                    <span className="font-medium text-gray-700">🚚 Envío a domicilio</span>
                </label>
            </div>

            {/* Formulario + Resumen */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Formulario */}
                <div>
                    <h2
                        className={`text-2xl font-bold mb-4 transition-colors duration-300 ${tipoEntrega === "retiro" ? "text-gray-500" : "text-gray-900"
                            }`}
                    >
                        Formulario de envío
                    </h2>

                    <fieldset
                        disabled={tipoEntrega === "retiro"}
                        className={`transition-all duration-300 ${tipoEntrega === "retiro" ? "opacity-50 pointer-events-none" : "opacity-100"
                            }`}
                    >
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Nombre del receptor</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Joaquín"
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Dirección</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Calle 3221"
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Correo electrónico</label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo@dominio.cl"
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Teléfono</label>
                            <div className="flex items-center gap-2 w-full">
                                <span className="px-3 py-2 border rounded-md bg-gray-100 text-gray-700 whitespace-nowrap">
                                    +56 9
                                </span>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                                    placeholder="8888 8888"
                                    className="border rounded-md p-2 w-full"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Formato requerido: 8888 8888</p>
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Comentarios</label>
                            <textarea
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                placeholder="Portón blanco, tocar timbre..."
                                rows={3}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                    </fieldset>

                    <div className="mt-4">
                        <label className="block font-semibold mb-1">Fecha de entrega</label>
                        <input
                            type="date"
                            value={fechaEntrega}
                            min={minFecha || undefined}
                            max={maxFecha || undefined}
                            onChange={(e) => {
                                const selected = e.target.value;
                                if (selected && !allowedDates.has(selected)) {
                                    showAlert("Esa fecha no está disponible. Elige una de la lista.", "warning");
                                    return;
                                }
                                setFechaEntrega(selected);
                            }}
                            disabled={loadingDisponibilidad || slots.length === 0}
                            className="w-full border rounded-md p-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Selecciona un día disponible según la capacidad.
                        </p>
                    </div>
                </div>

                {/* Resumen del total */}
                <div className="border rounded-lg p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-6">Total</h2>
                        <p className="text-4xl font-extrabold text-center text-red-600 mb-4">
                            ${totalFinal.toLocaleString("es-CL")}
                        </p>
                        <ul className="text-gray-700 text-center">
                            <li>
                                Total del carrito: ${totalCarrito.toLocaleString("es-CL")}
                            </li>
                            {tipoEntrega === "envio" && (
                                <li>Envío: ${costoEnvio.toLocaleString("es-CL")}</li>
                            )}
                        </ul>

                        {superaMaximo && (
                            <p className="text-sm text-red-600 mt-4 text-center">
                                El pedido supera el máximo permitido de productos.
                            </p>
                        )}

                        {!loadingDisponibilidad && slots.length === 0 && carrito.length > 0 && (
                            <p className="text-sm text-red-600 mt-4 text-center">
                                No hay fechas disponibles en este momento.
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handlePay}
                        disabled={isPayDisabled}
                        className={`bg-red-600 text-white font-semibold py-3 rounded-lg mt-6 transition-opacity ${
                            isPayDisabled
                                ? "opacity-50 cursor-default"
                                : "hover:bg-red-700 cursor-pointer"
                        }`}
                    >
                        Ir a pagar
                    </button>
                </div>
            </div>
        </div>
    );
}

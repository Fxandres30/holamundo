"use client";
import { useState, useEffect, useMemo } from "react";
import '../styles/globals.css';

interface DatosPago {
    cantidad: number;
    nombre: string;
    apellidos: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    correo: string;
    total: number;
}

export default function Rifa() {
    const [cantidad, setCantidad] = useState(10);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [datosPago, setDatosPago] = useState<DatosPago | null>(null); // Define el tipo de datosPago
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        direccion: "",
        ciudad: "",
        telefono: "",
        correo: ""
    });
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const cantidadMinima = 10;
    const cantidadMaxima = 300;
    const precioUnitario = 1500;
    const precioTotal = useMemo(() => cantidad * precioUnitario, [cantidad, precioUnitario]);

    useEffect(() => {
        if (!modalAbierto) {
            setErrores({});
        }
    }, [modalAbierto]);

    const validarFormulario = () => {
        const nuevosErrores: { [key: string]: string } = {};

        if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
        if (!formData.apellidos.trim()) nuevosErrores.apellidos = "Los apellidos son obligatorios";
        if (!formData.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
        if (!formData.ciudad.trim()) nuevosErrores.ciudad = "La ciudad es obligatoria";
        if (!formData.telefono.trim() || !/^[0-9]{7,15}$/.test(formData.telefono))
            nuevosErrores.telefono = "Teléfono inválido";
        if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo))
            nuevosErrores.correo = "Correo inválido";
        if (cantidad < cantidadMinima || cantidad > cantidadMaxima)
            nuevosErrores.cantidad = `Debe elegir entre ${cantidadMinima} y ${cantidadMaxima} boletos.`;

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const abrirModal = () => setModalAbierto(true);
    const cerrarModal = () => setModalAbierto(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let nuevaCantidad = parseInt(e.target.value, 10) || cantidadMinima;

        if (nuevaCantidad < cantidadMinima) {
            setErrores(prev => ({ ...prev, cantidad: `Debe elegir al menos ${cantidadMinima} boletos.` }));
        } else if (nuevaCantidad > cantidadMaxima) {
            setErrores(prev => ({ ...prev, cantidad: `No puede elegir más de ${cantidadMaxima} boletos.` }));
        } else {
            setErrores(prev => {
                const nuevosErrores = { ...prev };
                delete nuevosErrores.cantidad;
                return nuevosErrores;
            });
        }

        setCantidad(nuevaCantidad);
    };
    
    console.log("Enviando datos a la API de pago:", datosPago);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validarFormulario()) return;

        const datosCompra: DatosPago = {
            cantidad,
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            direccion: formData.direccion,
            ciudad: formData.ciudad,
            telefono: formData.telefono,
            correo: formData.correo,
            total: precioTotal,
        };
        setDatosPago(datosCompra); // Guardamos temporalmente los datos

        try {
            const response = await fetch("/api/mercadopago", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosCompra),
            });

            const data = await response.json();

            if (data.success && data.init_point) {
                cerrarModal();
                window.location.href = data.init_point;
            } else {
                console.error("Error al obtener el link de pago", data);
                alert("Hubo un problema al generar el link de pago. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error en la solicitud a Mercado Pago:", error);
            alert("Ocurrió un error al procesar tu solicitud. Por favor, verifica tu conexión e inténtalo nuevamente.");
        }
    };

    return (
        <section id="rifa" className="rifa-container">
            <h2 className="rifa-title">Elige Cantidad</h2>
            <div className="rifa-options">
                {[10, 15, 25, 50, 90, 120].map((num) => (
                    <button key={num} className="rifa-button" onClick={() => { setCantidad(num); abrirModal(); }}>
                        Comprar {num} boletos
                    </button>
                ))}
                <div className="cantidad-libre">
                    <label>Elegir cantidad:</label>
                    <input
                        type="number"
                        value={cantidad}
                        min={cantidadMinima}
                        max={cantidadMaxima}
                        onChange={handleCantidadChange}
                    />
                    <button className="rifa-button" onClick={abrirModal}>Comprar</button>
                    {errores.cantidad && <p className="error">{errores.cantidad}</p>}
                </div>
            </div>

            {modalAbierto && (
                <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}>
                    <div className="modal-content">
                        <h3>Verificar Datos</h3>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(formData).map((campo) => (
                                <div key={campo}>
                                    <label htmlFor={campo}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                                    <input
                                        id={campo}
                                        type="text"
                                        name={campo}
                                        value={formData[campo as keyof typeof formData]}
                                        onChange={handleChange}
                                    />
                                    {errores[campo] && <p className="error">{errores[campo]}</p>}
                                </div>
                            ))}
                            <p>Total a pagar: ${precioTotal.toLocaleString()} COP</p>
                            {datosPago && (
                                <div>
                                    <h4>Resumen de la compra:</h4>
                                    <p>Cantidad: {datosPago.cantidad}</p>
                                    <p>Total: ${datosPago.total.toLocaleString()} COP</p>
                                </div>
                            )}
                            <button type="submit" className="confirmar-compra">Confirmar Compra</button>
                            <button type="button" onClick={cerrarModal} className="cerrar-modal">Cerrar</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
} 
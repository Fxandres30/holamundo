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
    const [datosPago, setDatosPago] = useState<DatosPago | null>(null);
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
        if (!modalAbierto) setErrores({});
    }, [modalAbierto]);

    const validarFormulario = () => {
        const nuevosErrores: { [key: string]: string } = {};

        if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
        if (!formData.apellidos.trim()) nuevosErrores.apellidos = "Los apellidos son obligatorios";
        if (!formData.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
        if (!formData.ciudad.trim()) nuevosErrores.ciudad = "La ciudad es obligatoria";
        if (!/^[0-9]{7,15}$/.test(formData.telefono))
            nuevosErrores.telefono = "Teléfono inválido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo))
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
        const nuevaCantidad = parseInt(e.target.value, 10);
        if (isNaN(nuevaCantidad)) return;
        setCantidad(Math.min(Math.max(nuevaCantidad, cantidadMinima), cantidadMaxima));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validarFormulario()) return;

        const datosPago: DatosPago = {
            cantidad,
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            direccion: formData.direccion,
            ciudad: formData.ciudad,
            telefono: formData.telefono,
            correo: formData.correo,
            total: precioTotal,
        };

        console.log("Datos enviados a Mercado Pago:", datosPago);
        setDatosPago(datosPago);

        try {
            const response = await fetch("/api/mercadopago", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosPago),
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.init_point) {
                cerrarModal();
                window.location.href = data.init_point;
            } else {
                console.error("Error al obtener el link de pago", data);
            }
        } catch (error) {
            console.error("Error en la solicitud a Mercado Pago:", error);
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
                            {[
                                { label: "Nombre", name: "nombre" },
                                { label: "Apellidos", name: "apellidos" },
                                { label: "Dirección", name: "direccion" },
                                { label: "Ciudad", name: "ciudad" },
                                { label: "Teléfono", name: "telefono" },
                                { label: "Correo", name: "correo" }
                            ].map(({ label, name }) => (
                                <div key={name}>
                                    <label htmlFor={name}>{label}</label>
                                    <input
                                        id={name}
                                        type="text"
                                        name={name}
                                        value={formData[name as keyof typeof formData]}
                                        onChange={handleChange}
                                    />
                                    {errores[name] && <p className="error">{errores[name]}</p>}
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

"use client";
import { useState, useEffect } from "react";
import '../styles/globals.css';

export default function Rifa() {
    const [cantidad, setCantidad] = useState(10);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        direccion: "",
        ciudad: "",
        telefono: "",
        correo: ""
    });
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const precioUnitario = 1500;
    const precioTotal = cantidad * precioUnitario;

    const cantidadMinima = 10;
    const cantidadMaxima = 300;

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
        if (nuevaCantidad < cantidadMinima) nuevaCantidad = cantidadMinima;
        if (nuevaCantidad > cantidadMaxima) nuevaCantidad = cantidadMaxima;
        setCantidad(nuevaCantidad);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (validarFormulario()) {
            try {
                const response = await fetch("/api/mercadopago", { 
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cantidad: cantidad,
                        nombre: formData.nombre,
                        correo: formData.correo,
                        telefono: formData.telefono,
                        precioUnitario: 1500,
                    }),
                });

                const data = await response.json();
                
                if (data.init_point) {
                    cerrarModal(); // Cerrar modal antes de redirigir
                    window.location.href = data.init_point; 
                } else {
                    console.error("Error al obtener el link de pago", data);
                }
            } catch (error) {
                console.error("Error en la solicitud a Mercado Pago:", error);
            }
        }
    };

    return (
        <section id="rifa" className="rifa-container">
            <h2 className="rifa-title">Eligir Cantidad</h2>
            <div className="rifa-options">
                {[10, 15, 25, 50, 90, 120].map((num) => (
                    <button key={num} className="rifa-button" onClick={() => { setCantidad(num); abrirModal(); }}>
                        Comprar {num} boletos
                    </button>
                ))}
                <div className="cantidad-libre">
                    <label>Elige la cantidad:</label>
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
                <div 
                    className="modal" 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) cerrarModal();
                    }}
                >
                    <div className="modal-content">
                        <h3>Verificación de Datos</h3>
                        <form onSubmit={handleSubmit}>
                            {Object.keys(formData).map((campo) => (
                                <div key={campo}>
                                    <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                                    <input 
                                        type="text" 
                                        name={campo} 
                                        value={formData[campo as keyof typeof formData]} 
                                        onChange={handleChange} 
                                    />
                                    {errores[campo] && <p className="error">{errores[campo]}</p>}
                                </div>
                            ))}
                            <p>Total a pagar: ${precioTotal.toLocaleString()} COP</p>
                            <button type="submit" className="confirmar-compra">Confirmar Compra</button>
                            <button type="button" onClick={cerrarModal} className="cerrar-modal">Cerrar</button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
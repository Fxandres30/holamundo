"use client";
import { useState } from "react";
import useFetchBoletos from "@/lib/useFetchBoletos"; // Asegúrate de importar correctamente

interface Boleto {
  id: number;
  numero: string;
  precio: number;
}

export default function VerBoletosModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const { boletos, loading, error, fetchBoletos } = useFetchBoletos();

  const handleBuscar = () => {
    if (input.trim() !== "") {
      fetchBoletos(input);
    }
  };

  // ✅ Mover la función fuera del return
  const manejarBoleto = (boleto: Boleto) => {
    console.log(`Boleto #${boleto.numero} con precio de ${boleto.precio} COP`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Mis Boletos</h2>

        <input
          type="text"
          placeholder="Ingrese su correo o teléfono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={handleBuscar}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Buscar
        </button>

        {loading && <p className="text-gray-500 mt-3">Cargando...</p>}
        {error && <p className="text-red-500 mt-3">{error}</p>}

        {boletos.length > 0 && (
          <ul className="mt-3">
            {boletos.map((boleto: Boleto) => (
              <li key={boleto.numero} className="border-b py-2">
                🎟️ Boleto: {boleto.numero}
                <button
                  onClick={() => manejarBoleto(boleto)}
                  className="ml-2 text-blue-500"
                >
                  Ver detalles
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 py-2 rounded hover:bg-gray-400"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

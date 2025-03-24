import { useState } from "react";
import useFetchBoletos from "@/lib/useFetchBoletos";

export default function VerBoletosModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const { boletos, loading, error, fetchBoletos } = useFetchBoletos();

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Mis Boletos</h2>
        <input
          type="text"
          placeholder="Ingrese su correo o teléfono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => fetchBoletos(input)}>Buscar</button>
        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {boletos.length > 0 && (
          <ul>
            {boletos.map((boleto) => (
                <li key={(boleto as { numero: string }).numero}>Boleto: {(boleto as { numero: string }).numero}</li>
            ))}
          </ul>
        )}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

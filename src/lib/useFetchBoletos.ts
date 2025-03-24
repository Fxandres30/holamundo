import { useState } from "react";

export default function useFetchBoletos() {
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchBoletos(input: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/boletos?input=${input}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al obtener boletos");
      setBoletos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return { boletos, loading, error, fetchBoletos };
}
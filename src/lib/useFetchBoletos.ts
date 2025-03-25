import { useState } from "react";

interface Boleto {
  id: number;
  numero: string;
  precio: number;
}

export default function useFetchBoletos() {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoletos = async (input: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boletos?query=${input}`);
      if (!response.ok) {
        throw new Error("Error al buscar boletos");
      }
      const data = await response.json();
      setBoletos(data.boletos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { boletos, loading, error, fetchBoletos };
}

"use client";
import { useState, useEffect } from "react";

export default function ProgressBar() {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchBoletosData = async () => {
      try {
        const response = await fetch("/api/boletos"); // Ruta de la API
        const data = await response.json();

        if (data.total > 0) {
          const soldPercentage = (data.vendidos / data.total) * 100;
          setPercentage(soldPercentage);
        }
      } catch (error) {
        console.error("Error al obtener los boletos:", error);
      }
    };

    fetchBoletosData();
    const interval = setInterval(fetchBoletosData, 5000); // Actualiza cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }}>
        {percentage.toFixed(2)}%
      </div>
    </div>
  );
}

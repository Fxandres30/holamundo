import React, { useEffect, useCallback } from "react";
import "../styles/globals.css"; // Importa los estilos

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  // Función para cerrar con la tecla Escape
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay active" onClick={onClose} role="dialog" aria-labelledby="modal-title">
      {/* Contenedor del modal */}
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Botón de cerrar */}
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
          ✖
        </button>

        {/* Contenido del modal */}
        <h2 id="modal-title">Información del Sorteo</h2>
        <p>🎟️ Compra tus boletos y participa en el gran sorteo.</p>
        <p>🏆 ¡Gana premios increíbles con solo un boleto!</p>
        <p>📅 Fecha del sorteo: <strong>30 de junio de 2025</strong>.</p>
        <p>⚠️ ¡No te quedes sin participar!</p>

        {/* Botón de acción */}
        <button className="modal-button" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

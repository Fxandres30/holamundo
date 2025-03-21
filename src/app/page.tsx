import Rifa from "./components/Rifa";// Asegúrate de que la ruta sea correcta

import './styles/globals.css';
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Asegúrate de importar los íconos
 

export default function Home() {
    return (
        <div>
            <header>
                <h1>Bienvenido a Mi Rifa</h1>
            </header>

            <div>Imagenes</div>

            <main>
                <Rifa />  {/* Aquí se muestra el contenido principal */}
            </main>
            
            <footer className="footer">
      <p className="contact-info">
        📧 <a href="mailto:ventas@inversionesefaat.com">ventas@inversionesefaat.com</a> 
        | 📞 <a href="tel:3154160126">3154160126</a>
      </p>
      <div className="social-icons">
        <a href="#" className="icon whatsapp">
          <FaWhatsapp />
        </a>
        <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="icon instagram">
          <FaInstagram />
        </a>
      </div>
    </footer>
     </div>
    );
}

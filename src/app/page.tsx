import Rifa from "./components/Rifa"; // Asegúrate de que la ruta sea correcta 
import Image from "next/image"; // Importar correctamente la imagen en Next.js
import './styles/globals.css';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from "react-icons/fa"; // Importar íconos

export default function Home() {
    return (
        <div className="home-container">
            <header className="header">
                <h1>Título. Nombre</h1>
            </header>

            {/* Contenedor de la imagen */}
            <div className="image-container">
                <Image 
                    src="/PS5.jpg" 
                    alt="Premio del sorteo" 
                    width={500} 
                    height={300} 
                    className="rifa-image"
                />
            </div>

            {/* Contenido principal separado */}
            <main className="main-content">
                <Rifa />
            </main>

            <footer className="footer">
                
                <div className="social-icons">
                    <a href="#" className="icon whatsapp">
                        <FaWhatsapp />
                    </a>
                    <a href="#" className="icon facebook">
                        <FaFacebook />
                    </a>
                    <a href="#" className="icon telegram">
                        <FaTelegram />
                    </a>
                    <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="icon instagram">
                        <FaInstagram />
                    </a>
                </div>
                <p className="contact-info">
                    <a href="mailto:ventas@efaat.com">ventas@efaat.com</a> ｜ 
                    <a href="tel:3154160126">3154160126</a>
                </p>
            </footer>
        </div>
    );
}

import Rifa from "./components/Rifa"; // Asegúrate de que la ruta sea correcta 
import Image from "next/image"; // Importar correctamente la imagen en Next.js
import './styles/globals.css';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from "react-icons/fa"; // Importar ícono
import ProgressBar from "./api/boletos/ProgressBar";



export default function Home() {
    return (
        <div className="home-container">
            <header className="header">
                <div className="image-container">
                    <Image 
                        src="/titulo.png" 
                        width={375} // Ajusta el tamaño según tu imagen
                        height={100} 
                        alt="Título"
                    />
                </div>
            </header>

            {/* Contenedor de la imagen */}
            <div className="image-container">
                <Image 
                    src="/PS5.jpg" 
                    alt="Premio del sorteo" 
                    width={400} 
                    height={400} 
                    className="rifa-image"
                />
            </div>

            <ProgressBar />

                <main className="main-content">
                <Rifa />
            </main>

            <footer className="footer">
                
                <div className="social-icons">
                    <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="icon whatsapp">
                        <FaWhatsapp />
                    </a>
                    <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="icon facebook">
                        <FaFacebook />
                    </a>
                    <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="icon telegram">
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

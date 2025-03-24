"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram } from "react-icons/fa";
import Rifa from "@/app/components/Rifa"; 
import InfoModal from "@/app/components/InfoModal";
import '@/app/styles/globals.css';



export default function Home() {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="home-container">
      {/* 🔹 Header con logo */}
      <header className="header">
        <div className="image-container">
          <Image src="/titulo.png" width={250} height={70} alt="Título" />
        </div>
      </header>

      <h2 className="subtitle">Participa en el sorteo y gana increíbles premios</h2>

      {/* 🔹 Imagen del premio con botón de información */}
      <div className="image-container">
        <Image src="/PS5.jpg" alt="Premio del sorteo" width={280} height={280} className="rifa-image" />
      </div>

      <div>
        <button className="info-button" onClick={() => setShowInfoModal(true)}>
          ℹ️ Más Información
        </button>
      </div>

      {/* 🔹 Modal de información */}
      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
  

      {/* 🔹 Contenido principal */}
      <main className="main-content">
        <Rifa />
      </main>

      {/* 🔹 Footer con redes sociales */}
      <footer className="footer">
        <div className="social-icons">
          <Link href="https://wa.me/3154160126" className="icon whatsapp" target="_blank">
            <FaWhatsapp />
          </Link>
          <Link href="https://www.facebook.com/fxandres30" className="icon facebook" target="_blank">
            <FaFacebook />
          </Link>
          <Link href="https://t.me/fxandres30" className="icon telegram" target="_blank">
            <FaTelegram />
          </Link>
          <Link href="https://www.instagram.com/fxandres30" className="icon instagram" target="_blank">
            <FaInstagram />
          </Link>
        </div>
        <p className="contact-info">
          <a href="mailto:ventas@efaat.com">ventas@efaat.com</a> ｜ 
          <a href="tel:3154160126">3154160126</a>
        </p>
      </footer>
    </div>
  );
}

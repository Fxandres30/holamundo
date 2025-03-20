import Rifa from "./components/Rifa";// Asegúrate de que la ruta sea correcta

import './styles/globals.css';
 

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
            
            <footer className="w-full mt-10 text-center bg-black text-white p-4">
              <p className="text-sm sm:text-base">
                📧 <a href="mailto:ventas@inversionesefaat.com" className="hover:underline">ventas@inversionesefaat.com</a> 
               | 📞 <a href="tel:3014123951" className="hover:underline">3154160126</a>
              </p>
                  <div className="flex justify-center mt-2 space-x-4">
                     <a href="#" className="whatsapp-link">💬 WhatsApp</a>
                     <a href="https://www.instagram.com/fxandres30?igsh=MTgzbXo4cHo4cGs3cQ==" className="instagram-link">📷 Instagram</a>
                 </div>
           </footer>
     </div>
    );
}

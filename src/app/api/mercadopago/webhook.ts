import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios"; // 📌 Asegúrate de instalar axios con: npm install axios
import { createClient } from "@supabase/supabase-js"; // 📌 Si usas Supabase

// 🔑 Agrega tu Access Token de Mercado Pago
const MERCADO_PAGO_ACCESS_TOKEN = "TU_ACCESS_TOKEN"; 

// 📌 Configura tu base de datos (ejemplo con Supabase)
const supabase = createClient("TU_SUPABASE_URL", "TU_SUPABASE_ANON_KEY");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  console.log("Webhook recibido:", req.body);

  // 🔍 Verifica que la solicitud contiene un ID de pago
  if (!req.body || !req.body.data?.id) {
    return res.status(400).json({ error: "Datos faltantes en el webhook" });
  }

  const paymentId = req.body.data.id; // ID del pago recibido

  try {
    // ✅ 1. Consultar Mercado Pago para obtener los detalles del pago
    const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    const paymentData = paymentResponse.data;
    console.log("📌 Datos completos del pago:", paymentData);

    // ✅ 2. Guardar en la base de datos (ejemplo con Supabase)
    const { error } = await supabase.from("pagos").insert([
      {
        id_pago: paymentData.id,
        estado: paymentData.status,
        metodo_pago: paymentData.payment_method_id,
        monto: paymentData.transaction_amount,
        email_comprador: paymentData.payer.email,
        fecha_pago: paymentData.date_created,
      }
    ]);

    if (error) {
      console.error("❌ Error al guardar en la base de datos:", error);
      return res.status(500).json({ error: "Error al guardar en la base de datos" });
    }

    return res.status(200).json({ message: "Pago guardado correctamente" });
  } catch (error) {
    console.error("❌ Error al obtener los detalles del pago:", error);
    return res.status(500).json({ error: "Error al obtener los detalles del pago" });
  }
}
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  console.log("📩 Webhook recibido:", req.body);

  const paymentId = req.body.data?.id || req.query.id;
  if (!paymentId) {
    console.error("❌ Solicitud incorrecta: Falta el ID del pago");
    return res.status(400).json({ error: "Solicitud incorrecta: Falta el ID del pago" });
  }

  try {
    // ✅ OBTENER LOS DATOS DEL PAGO DESDE MERCADO PAGO
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    const paymentData = await response.json();
    console.log("✅ Datos del pago:", paymentData);

    if (paymentData.status === "approved") {
      // Registrar el pago como aprobado
    } else if (paymentData.status === "pending") {
      // Registrar el pago como pendiente
    } else {
      console.log("❌ Estado del pago no manejado:", paymentData.status);
      return res.status(400).json({ error: "Estado del pago no manejado" });
    }

    // 🔹 Extraer datos del comprador
    const comprador = {
      nombre: paymentData.payer.first_name || "Desconocido",
      apellidos: paymentData.payer.last_name || "Desconocido",
      correo: paymentData.payer.email,
      telefono: paymentData.payer.phone?.number || "No disponible",
      direccion: paymentData.additional_info?.shipments?.receiver_address?.street_name || "No disponible",
      ciudad: paymentData.additional_info?.shipments?.receiver_address?.city?.name || "No disponible",
    };

    // 🚀 Conectar con Supabase
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

    // ✅ GUARDAR USUARIO EN LA TABLA `usuarios`
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .upsert([
        {
          nombre: comprador.nombre,
          apellidos: comprador.apellidos,
          correo: comprador.correo,
          telefono: comprador.telefono,
          direccion: comprador.direccion,
          ciudad: comprador.ciudad,
        }
      ], { onConflict: "correo" });

    if (userError) {
      console.error("❌ Error al guardar usuario:", userError);
      throw userError;
    }
    console.log("✅ Usuario guardado en la base de datos:", userData);

    // ✅ GUARDAR EL PAGO EN LA TABLA `pagos`
    const { data: paymentDB, error: paymentError } = await supabase
      .from("pagos")
      .insert([
        {
          id_pago: paymentData.id,
          correo: comprador.correo,
          monto: paymentData.transaction_amount,
          estado: paymentData.status,
          metodo_pago: paymentData.payment_method_id,
        }
      ]);

    if (paymentError) {
      console.error("❌ Error al guardar pago:", paymentError);
      throw paymentError;
    }
    console.log("✅ Pago guardado en la base de datos:", paymentDB);

    return res.status(200).json({ message: "Pago y usuario registrados con éxito" });

  } catch (error) {
    console.error("❌ Error al procesar el webhook:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

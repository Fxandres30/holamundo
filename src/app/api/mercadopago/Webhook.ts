import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import AWS from "aws-sdk";
import axios from "axios";

const router = express.Router();

// Configuración de Supabase
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

// Validar variables de entorno críticas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.MP_ACCESS_TOKEN) {
    throw new Error("Faltan variables de entorno necesarias");
}

// Configuración de Amazon SES
AWS.config.update({ region: "us-east-1" });
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

// Ruta para recibir confirmaciones de Mercado Pago
router.post("/webhook", express.json(), async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as { data?: { id?: string } };
        const paymentId = body?.data?.id;

        if (!paymentId) {
            console.error("❌ ID de pago no proporcionado en la solicitud");
            res.status(400).json({ message: "ID de pago no proporcionado" });
            return;
        }

        // Obtener detalles del pago desde Mercado Pago
        const paymentResponse = await axios.get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
            }
        );

        const paymentData = paymentResponse.data;

        // ⚠️ Solo procesar pagos aprobados
        if (paymentData.status !== "approved") {
            console.log("Pago no aprobado:", paymentData.status);
            res.status(400).json({ message: "Pago no aprobado" });
            return;
        }

        // Datos del comprador
        const email = paymentData.payer.email;
        const nombre = paymentData.payer.first_name;

        // 🔹 Enviar correo con Amazon SES
        const emailParams = {
            Destination: { ToAddresses: [email] },
            Message: {
                Body: { Text: { Data: `Hola ${nombre}, tu pago ha sido procesado exitosamente. Gracias por tu compra.` } },
                Subject: { Data: "🎟️ ¡Pago procesado exitosamente!" }
            },
            Source: "tucorreo@tudominio.com"
        };

        try {
            await ses.sendEmail(emailParams).promise();
        } catch (emailError) {
            console.error("Error al enviar el correo:", emailError);
            res.status(500).json({ message: "Error al enviar el correo" });
            return;
        }

        console.log("✅ Pago aprobado y correo enviado a:", email);
        res.status(200).json({ message: "Pago procesado y correo enviado" });
        return;

    } catch (error) {
        console.error("❌ Error en el webhook:", error);
        res.status(500).json({ message: "Error en el servidor" });
        return;
    }
});

export default router;

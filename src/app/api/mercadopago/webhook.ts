import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mlvijtnpgaxzsqanjhqi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmlqdG5wZ2F4enNxYW5qaHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTczMTYsImV4cCI6MjA1NjQzMzMxNn0.cM4FH13smbAg1ptLKFZD57o62GEXJgA9-6ipPa5fjUE"; // Usa la clave de servicio de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

const mercadoPagoToken = "APP_USR-TU_ACCESS_TOKEN"; // Reemplaza con tu Access Token de Mercado Pago

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const paymentId = body.data.id;

        // 🔹 Verificar el pago en Mercado Pago
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${mercadoPagoToken}` },
        });

        const paymentData = await paymentResponse.json();
        if (!paymentData || paymentData.status !== "approved") {
            return NextResponse.json({ success: false, message: "Pago no aprobado" });
        }

        // 🔹 Extraer datos necesarios
        const email = paymentData.payer.email;
        const nombre = paymentData.payer.first_name || "Desconocido";
        const apellido = paymentData.payer.last_name || "";
        const telefono = paymentData.payer.phone?.number || "";
        const monto = paymentData.transaction_amount;
        const cantidad_boletos = paymentData.metadata?.cantidad_boletos || 1;
        const sorteo_id = paymentData.metadata?.sorteo_id;

        // 🔹 Registrar solo los datos en Supabase
        const { data: pago, error: errorPago } = await supabase
            .from("pagos")
            .insert([{ nombre, apellido, correo: email, telefono, monto, cantidad_boletos, sorteo_id, estado: "aprobado" }])
            .select("id")
            .single();

            if (pago) {
                console.log("Pago registrado con ID:", pago.id);
            } 

        if (errorPago) {
            throw new Error("Error guardando pago en Supabase");
        }

        return NextResponse.json({ success: true, message: "Pago registrado en Supabase, se procesará automáticamente" });
    } catch (error) {
        console.error("Error en webhook:", error);
        return NextResponse.json({ success: false, message: "Error procesando el pago" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚡ Cargar credenciales de Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ⚡ Cargar credenciales de Mercado Pago
const mercadoPagoToken = process.env.MP_ACCESS_TOKEN!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("📩 Webhook recibido:", body); // 🔍 Ver qué llega

        const { topic, id } = body;

        if (!topic || !id) {
            console.error("❌ Notificación inválida: faltan datos", body);
            return NextResponse.json({ success: false, message: "Notificación inválida" }, { status: 400 });
        }

        // 📌 Si el topic es "payment", obtener detalles del pago
        let paymentData = null;

        if (topic === "payment") {
            const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
                headers: { Authorization: `Bearer ${mercadoPagoToken}` },
            });

            paymentData = await paymentResponse.json();
            console.log("🔍 Datos de Mercado Pago:", paymentData);

            if (!paymentData || paymentData.status !== "approved") {
                console.error("❌ Pago no aprobado o datos inválidos:", paymentData);
                return NextResponse.json({ success: false, message: "Pago no aprobado" }, { status: 400 });
            }
        } else {
            console.error("❌ Tipo de notificación no manejado:", topic);
            return NextResponse.json({ success: false, message: "Notificación no manejada" }, { status: 400 });
        }

        // 📌 Extraer datos y guardar en Supabase
        const pago = {
            nombre: paymentData.payer?.first_name || "Desconocido",
            correo: paymentData.payer?.email || "No registrado",
            monto: paymentData.transaction_amount,
            referencia_externa: paymentData.external_reference || null,
            estado: paymentData.status,
        };

        console.log("💾 Guardando en Supabase:", pago);

        const { data, error } = await supabase.from("pagos").insert([pago]).select("id").single();

        if (error) {
            console.error("❌ Error al guardar el pago en Supabase:", error);
            return NextResponse.json({ success: false, message: "Error al guardar el pago" }, { status: 500 });
        }

        console.log("✅ Pago guardado con éxito. ID del pago:", data.id);
        return NextResponse.json({ success: true, message: "Notificación procesada con éxito" });

    } catch (error) {
        console.error("❌ Error procesando la notificación:", error);
        return NextResponse.json({ success: false, message: "Error procesando la notificación" }, { status: 500 });
    }
}

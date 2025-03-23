import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

// 📌 Configuración de Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const payment = await req.json();

    if (payment.action === "payment.updated" && payment.data.status === "approved") {
      const { external_reference, transaction_amount, id } = payment.data;
      const compra = JSON.parse(external_reference);
      const { correo, cantidad } = compra;

      // 📌 Actualizar la compra en Supabase
      const { data, error } = await supabase
        .from("compras")
        .update({ estado: "aprobado", pago_id: id })
        .eq("correo", correo)
        .eq("estado", "pendiente");

      if (error) throw error;

      // 📌 Generar boletos en la base de datos
      const boletos = Array.from({ length: cantidad }, () => ({
        correo,
        estado: "vendido",
      }));

      const { error: boletoError } = await supabase.from("boletos").insert(boletos);
      if (boletoError) throw boletoError;

      console.log(`✅ Pago confirmado y boletos generados para ${correo}`);

      return NextResponse.json({ success: true, message: "Pago confirmado y boletos generados" });
    }

    return NextResponse.json({ success: false, message: "Pago no aprobado" });
  } catch (error) {
    console.error("❌ Error en el webhook de Mercado Pago:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Definir el tipo de Request
import type { NextRequest } from "next/server";

// Configurar Mercado Pago
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error("⚠️ MERCADOPAGO_ACCESS_TOKEN no está definido.");
} else {
  mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN });
}

// API para manejar el pago
export async function POST(req: NextRequest) {
  try {
    const { cantidad, correo } = await req.json();
    const precioUnitario = 100;
    const total = cantidad * precioUnitario;

    console.log("✅ Recibida solicitud de pago:", { cantidad, correo, total });

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Boleto de rifa",
          quantity: cantidad,
          currency_id: "COP",
          unit_price: precioUnitario,
        },
      ],
      payer: {}, // Sin email para evitar conflictos
      back_urls: {
        success: "https://tudominio.com/exito",
        failure: "https://tudominio.com/error",
        pending: "https://tudominio.com/pendiente",
      },
      auto_return: "approved",
      binary_mode: true,
    });
    

    console.log("🔗 Link de pago generado:", preference.body.init_point);

    return NextResponse.json({ success: true, init_point: preference.body.init_point });

  } catch (error) {
    console.error("❌ Error al generar el pago:", error);
    return NextResponse.json(
      { success: false, message: "Error al generar el pago" },
      { status: 500 }
    );
  }
}

// Habilitar CORS en TypeScript
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

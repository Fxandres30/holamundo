import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Verificar que la variable de entorno no esté vacía
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error("⚠️ Error: MERCADOPAGO_ACCESS_TOKEN no está definido.");
} else {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

export async function POST(req: Request) {
  try {
    const { cantidad, correo } = await req.json();
    const precioUnitario = 100; // Precio por boleto en COP
    const total = cantidad * precioUnitario;

    console.log("🛒 Generando pago para:", cantidad, "boletos | Total:", total);

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Boleto de rifa",
          quantity: cantidad,
          currency_id: "COP",
          unit_price: precioUnitario,
        },
      ],
      payer: { email: correo },
      back_urls: {
        success: "https://tudominio.com/exito",
        failure: "https://tudominio.com/error",
        pending: "https://tudominio.com/pendiente",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 5, // Permitir solo una cuota
      },
      binary_mode: true, // Habilita pagos solo con confirmación automática (reduce el riesgo de reCAPTCHA)
    });

    console.log("✅ Preferencia generada: ", preference.body);

    return NextResponse.json({ success: true, init_point: preference.body.init_point });

  } catch (error: any) {
    console.error("❌ Error al obtener el link de pago:", error.message || error);
    return NextResponse.json(
      { success: false, message: "Error al generar el pago" },
      { status: 500 }
    );
  }
}

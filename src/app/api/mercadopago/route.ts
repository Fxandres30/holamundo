import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
});

export async function POST(req: Request) {
  try {
    const { cantidad, correo } = await req.json();
    const precioUnitario = 100; // 100 COP por boleto
    const total = cantidad * precioUnitario;

    console.log("Generando pago para:", cantidad, "boletos | Total:", total);

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
        excluded_payment_methods: [], // Permitir todos los métodos de pago
        excluded_payment_types: [], // Permitir todos los tipos de pago
        installments: 1 // Permitir solo una cuota (puedes ajustarlo)
      },
    });

    console.log("Preferencia generada: ", preference.body);

    return NextResponse.json({ success: true, init_point: preference.body.init_point });

  } catch (error) {
    console.error("Error al obtener el link de pago:", error);
    return NextResponse.json({ success: false, message: "Error al generar el pago" }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
});

export async function POST(req: Request) {
  try {
    const { cantidad, correo } = await req.json();
    const precioUnitario = 1000; // Precio de un boleto (ajústalo según necesites)
    const total = cantidad * precioUnitario;

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
    });

    return NextResponse.json({ success: true, init_point: preference.body.init_point });

  } catch (error) {
    console.error("Error en Mercado Pago:", error);
    return NextResponse.json({ success: false, error: "Error en el pago" }, { status: 500 });
  }
}


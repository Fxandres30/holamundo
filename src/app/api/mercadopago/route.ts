import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabase } from "@/lib/supabaseClient";

// Configurar Mercado Pago con el token
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "TU_ACCESS_TOKEN_AQUI",
});

const { data, error } = await supabase.from("pagos").select("*");

if (error) {
    console.error("Error al consultar la base de datos:", error);
} else {
    console.log("Datos obtenidos:", data);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Datos recibidos en la API:", body);

    // Validación básica
    if (!body?.cantidad || !body?.total || !body?.correo) {
      console.error("⚠️ Error: Datos faltantes en la petición", body);
      return NextResponse.json(
        { error: "Formato incorrecto: faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Creación del array de items
    const items = [
      {
        id: `boleto-${Date.now()}`,
        title: "Boletos para el sorteo",
        quantity: body.cantidad,
        unit_price: body.total / body.cantidad,
        currency_id: "COP",
      },
    ];

    // Creación de la preferencia
    const preference = new Preference(mercadopago);
    const response = await preference.create({
      body: {
        items,
        payer: {
          name: body.nombre || "Cliente",
          surname: body.apellidos || "",
          email: body.correo,
          phone: { number: body.telefono || "" },
          address: {
            street_name: body.direccion || "Sin dirección",
            street_number: "0",
            zip_code: "00000",
          },
        },
        external_reference: `compra-${Date.now()}`,
        back_urls: {
          success: "https://holamundo-two.vercel.app",
          failure: "https://tusitio.com/failure",
          pending: "https://tusitio.com/pending",
        },
        auto_return: "approved",
        notification_url: "https://holamundo-two.vercel.app/api/mercadopago/webhook",
      },
    });

    console.log("✅ URL de pago generada:", response.sandbox_init_point || response.init_point);

    return NextResponse.json({
      success: true,
      init_point: response.sandbox_init_point || response.init_point,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia" },
      { status: 500 }
    );
  }
}

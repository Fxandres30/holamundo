import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
/*import { supabase } from "@/lib/supabaseClient"; */// Importar Supabase

// Configuración de Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-2608907329035760-032415-597a6ea2dd30fa45a4b4bc75c9a0d1ab-2299422857", // Token de prueba
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Datos recibidos en la API:", body);

    // Validación básica
    if (!body || !body.cantidad || !body.total || !body.correo) {
      console.error("⚠️ Error: Datos faltantes en la petición", body);
      return NextResponse.json(
        { error: "Formato incorrecto: faltan datos obligatorios" },
        { status: 400 }
      );
    }
  
    // Construcción del array de `items` correctamente con `id`
    const items = [
      {
        id: `boleto-${Date.now()}`, // ID único para el producto
        title: "Boletos para el sorteo",
        quantity: body.cantidad,
        unit_price: body.total / body.cantidad,
        currency_id: "COP",
      },
    ];

    // Creación de la preferencia de pago
    const preference = new Preference(mercadopago);
    const response = await preference.create({
      body: {
        items, // Usamos el array correcto con `id`
        payer: {
          name: body.nombre,
          surname: body.apellidos,
          email: body.correo,
          phone: { number: body.telefono },
          address: {
            street_name: body.direccion, // ✅ Se mantiene `street_name`
            street_number: "0", // ✅ Se agrega un valor por defecto ya que es requerido
            zip_code: "00000", // ✅ Se agrega un valor por defecto para evitar errores
          },
        },
        external_reference: `compra-${Date.now()}`,
        back_urls: {
          success: "https://tusitio.com/success",
          failure: "https://tusitio.com/failure",
          pending: "https://tusitio.com/pending",
        },
        auto_return: "approved",
        notification_url: "https://tusitio.com/api/webhook",
      },
    });

    console.log("✅ URL de pago generada:", response.init_point);
    

    return NextResponse.json({ success: true, url: response.init_point });
  } catch (error: unknown) {
    console.error("❌ Error creando preferencia:", error);
    return NextResponse.json({ error: "Error al crear la preferencia" }, { status: 500 });
  }
}

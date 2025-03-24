import { NextResponse } from "next/server"; 
import { createClient } from "@supabase/supabase-js";  
import { MercadoPagoConfig, Preference } from "mercadopago";

// ✅ Configurar Mercado Pago correctamente
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  try {
    // ✅ Leer datos de la solicitud
    const { cantidad, correo, nombre, telefono } = await req.json();

    // ✅ Validar datos de entrada
    if (
      !cantidad || cantidad <= 0 ||
      !correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      !nombre || nombre.trim().length === 0 ||
      !telefono || !/^\d{7,15}$/.test(telefono)
    ) {
      return NextResponse.json({ success: false, message: "Datos inválidos" }, { status: 400 });
    }

    const precioUnitario = 1500;
    const total = cantidad * precioUnitario;

    // ✅ Verificar si el usuario ya tiene una compra pendiente
    const { data: compraPendiente, error: errorCompra } = await supabase
      .from("compras")
      .select("id")
      .eq("correo", correo)
      .eq("estado", "pendiente")
      .single();

    if (errorCompra) {
      console.error("Error en la consulta de compra pendiente:", errorCompra);
    }

    if (compraPendiente) {
      return NextResponse.json({ success: false, message: "Ya tienes una compra pendiente." }, { status: 400 });
    }

    // ✅ Crear la preferencia usando la clase Preference correctamente
    const preference = new Preference(mercadopago);
    const response = await preference.create({
      body: {
        items: [
          {
            id: "1",
            title: "Compra de boletos",
            quantity: cantidad,
            currency_id: "COP",
            unit_price: parseFloat(precioUnitario.toFixed(2)),
          },
        ],
        payer: {
          email: correo,
          name: nombre,
          phone: { number: telefono.toString() },
        },
        back_urls: {
          success: "https://tu-sitio.com/exito",
          failure: "https://tu-sitio.com/fallo",
          pending: "https://tu-sitio.com/pendiente",
        },
        auto_return: "approved",
        statement_descriptor: "Compra Boletos",
      },
    });

    if (!response || !response.init_point) {
      throw new Error("No se pudo generar el enlace de pago.");
    }

    console.log("✅ Enlace de pago generado:", response.init_point);

    return NextResponse.json({ success: true, link_de_pago: response.init_point });

  } catch (error) {
    console.error("❌ Error en el proceso:", error);
    return NextResponse.json({ success: false, message: "Ocurrió un error en el servidor." }, { status: 500 });
  }
}

// ✅ Habilitar CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

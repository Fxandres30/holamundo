import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 📌 Configuración de Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// 📌 Configuración de Mercado Pago
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  throw new Error("⚠️ MERCADOPAGO_ACCESS_TOKEN no está definido en el entorno.");
}

mercadopago.configure({ access_token: ACCESS_TOKEN });

export async function POST(req: NextRequest) {
  try {
    const { cantidad, correo, nombre, telefono } = await req.json();

    if (!cantidad || cantidad <= 0 || !correo) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos" },
        { status: 400 }
      );
    }

    const precioUnitario = 1500;
    const total = cantidad * precioUnitario;

    console.log("✅ Recibida solicitud de pago:", { cantidad, correo, total });

    // 📌 Guardar la compra en Supabase con estado "pendiente"
    const { data, error } = await supabase.from("compras").insert([
      {
        nombre,
        correo,
        telefono,
        cantidad_boletos: cantidad,
        total_pagado: total,
        estado: "pendiente",
      },
    ]);

    if (error) throw error;

    // 📌 Crear preferencia de pago
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Boleto de rifa",
          quantity: cantidad,
          currency_id: "COP",
          unit_price: precioUnitario,
        },
      ],
      payer: {
        email: correo,
        name: nombre,
        phone: { 
          area_code: "57", // Código de área predeterminado
          number: telefono 
        },
      },
      back_urls: {
        success: "https://tudominio.com/exito",
        failure: "https://tudominio.com/error",
        pending: "https://tudominio.com/pendiente",
      },
      auto_return: "approved",
      binary_mode: true,
      notification_url: "https://tudominio.com/api/mercadopago-webhook",
      external_reference: JSON.stringify({ correo, cantidad, total }),
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

// 📌 Habilitar CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.data.id;

    // Verificar si el pago ya existe
    const { data: pagoExistente } = await supabase
      .from("pagos")
      .select("id")
      .eq("id", paymentId)
      .single();

    if (pagoExistente) {
      return NextResponse.json({ _error: "El pago ya fue registrado." }, { status: 400 });
    }

    // Obtener el correo del cuerpo de la solicitud
    const correo = body.data.correo;

    // Verificar o crear usuario
    const { data: usuario, error: usuarioError } = await supabase
      .rpc("get_or_create_user", { correo });
    if (usuarioError || !usuario) {
      throw new Error("Error al obtener o crear el usuario");
    }

    // Obtener el monto del cuerpo de la solicitud
    const monto = body.data.monto;

    // Guardar el pago
    const { error: pagoError } = await supabase
  .from("pagos")
  .insert([{ id: paymentId, usuario_id: usuario.id, monto: monto, estado: "confirmado" }])
  .select()
  .single();
    if (pagoError) throw pagoError;

    return NextResponse.json({ message: "Pago confirmado" });
  } catch (error) {
    console.error("❌ Error al procesar el pago:", error);
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
  }
}

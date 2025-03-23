import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.data.id;

    // Validar el pago en Mercado Pago
    const payment = await mercadopago.payment.findById(paymentId);
    if (payment.response.status !== "approved") {
      return NextResponse.json({ error: "Pago no aprobado" }, { status: 400 });
    }

    const correo = payment.response.payer.email;
    const monto = payment.response.transaction_amount;
    const cantidadBoletos = monto / 1500;

  // Verificar si el usuario existe
let { data: usuario, error: usuarioError } = await supabase
.from("usuarios")
.select("id")
.eq("correo", correo)
.single();

if (usuarioError) {
throw usuarioError; // Manejar el error si ocurre
}

if (!usuario) {
const { data: nuevoUsuario, error: nuevoUsuarioError } = await supabase
  .from("usuarios")
  .insert([{ correo }])
  .select()
  .single();

if (nuevoUsuarioError) {
  throw nuevoUsuarioError; // Manejar el error si ocurre
}

usuario = nuevoUsuario; // Asignar el nuevo usuario
}

// Asegurarse de que usuario tiene la propiedad id
if (!usuario || !usuario.id) {
throw new Error("El usuario no tiene un ID válido");
}

// Guardar el pago
const { data: nuevoPago, error: pagoError } = await supabase
.from("pagos")
.insert([{ usuario_id: usuario.id, monto, estado: "confirmado" }])
.select()
.single();

if (pagoError) {
throw pagoError; // Manejar el error si ocurre
}


    // Generar boletos
    const boletos = Array.from({ length: cantidadBoletos }).map(() => ({
      numero: Math.floor(1000 + Math.random() * 9000),
      usuario_id: usuario.id,
      pago_id: nuevoPago.id,
      estado: "vendido",
    }));

    const { error: boletosError } = await supabase.from("boletos").insert(boletos);
    if (boletosError) throw boletosError;

    return NextResponse.json({ message: "Pago confirmado y boletos generados" });

  } catch (error) {
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
  }
}

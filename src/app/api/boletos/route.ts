import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    if (!correo) {
      return NextResponse.json({ error: "Correo es obligatorio" }, { status: 400 });
    }

    // Buscar usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", correo)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Buscar boletos
    const { data: boletos, error: boletosError } = await supabase
      .from("boletos")
      .select("numero, estado, fecha_compra")
      .eq("usuario_id", usuario.id);

    if (boletosError) throw boletosError;

    return NextResponse.json({ boletos });

  } catch (error) {
    return NextResponse.json({ error: "Error al consultar boletos" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  try {
    const { correo } = await req.json();

    // Validar formato del correo
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
    }

    // Buscar usuario por correo
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", correo)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Buscar boletos del usuario en sorteos activos
    const { data: boletos, error: boletosError } = await supabase
      .from("boletos")
      .select("numero, sorteos(nombre, estado), pagos(monto, fecha)")
      .eq("usuario_id", usuario.id)
      .eq("sorteos.estado", "activo") // Filtrar solo sorteos activos
      .order("pagos.fecha", { ascending: false });

    if (boletosError) {
      return NextResponse.json({ error: "Error al consultar boletos." }, { status: 500 });
    }

    return NextResponse.json({ boletos });
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud." }, { status: 500 });
  }
}

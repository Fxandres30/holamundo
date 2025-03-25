import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("🔔 Notificación recibida:", body);

        // Aquí puedes guardar el estado del pago en tu base de datos
        return NextResponse.json({ status: "success", data: body });
    } catch (error) {
        console.error("❌ Error en webhook:", error);
        return NextResponse.json({ error: "Error procesando la notificación" }, { status: 500 });
    }
}


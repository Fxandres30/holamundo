import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de tener Prisma configurado

export async function GET() {
  try {
    // Contamos el total de boletos
    const totalBoletos = await prisma.boletos.count();

    // Contamos los boletos con estado "vendido"
    const vendidos = await prisma.boletos.count({
      where: { estado: "vendido" },
    });

    // Retornamos la respuesta en JSON con un código 200 (OK)
    return NextResponse.json({ total: totalBoletos, vendidos }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /boletos:", error);
    return NextResponse.json(
      { error: "Error al obtener boletos" },
      { status: 500 }
    );
  }
}
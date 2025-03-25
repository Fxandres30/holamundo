import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mlvijtnpgaxzsqanjhqi.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdmlqdG5wZ2F4enNxYW5qaHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTczMTYsImV4cCI6MjA1NjQzMzMxNn0.cM4FH13smbAg1ptLKFZD57o62GEXJgA9-6ipPa5fjUE"; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const paymentId = body.data.id;

        // Consultar pago en Mercado Pago
        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer TU_ACCESS_TOKEN` },
        });

        const paymentData = await paymentResponse.json();
        if (!paymentData || paymentData.status !== "approved") {
            return NextResponse.json({ success: false, message: "Pago no aprobado" });
        }

        const email = paymentData.payer.email;
        const nombre = paymentData.payer.first_name || "Desconocido";
        const apellido = paymentData.payer.last_name || "";
        const telefono = paymentData.payer.phone?.number || "";
        const monto = paymentData.transaction_amount;
        const cantidad_boletos = paymentData.metadata?.cantidad_boletos || 1;
        const sorteo_id = paymentData.metadata?.sorteo_id;

        // 1️⃣ Buscar si el usuario ya existe en Supabase
        let { data: usuario,  } = await supabase
            .from("usuarios")
            .select("id")
            .eq("correo", email)
            .single();

        if (!usuario) {
            // Si no existe, lo creamos
            const { data: nuevoUsuario,  } = await supabase
                .from("usuarios")
                .insert([{ nombre, apellido, correo: email, telefono }])
                .select("id")
                .single();
            usuario = nuevoUsuario;
        }

        if (!usuario?.id) {
            throw new Error("Error creando/obteniendo usuario");
        }

        // 2️⃣ Guardar la compra en la tabla 'compras'
        const { data: compra, } = await supabase
            .from("compras")
            .insert([{ usuario_id: usuario.id, nombre, correo: email, telefono, cantidad_boletos, total_pagado: monto, estado: "completado" }])
            .select("id")
            .single();

        if (!compra?.id) {
            throw new Error("Error guardando compra");
        }

        // 3️⃣ Guardar el pago en la tabla 'pagos'
        const { data: pago, } = await supabase
            .from("pagos")
            .insert([{ usuario_id: usuario.id, monto, metodo_pago: "MercadoPago", estado: "aprobado", sorteo_id }])
            .select("id")
            .single();

        if (!pago?.id) {
            throw new Error("Error guardando pago");
        }

        // 4️⃣ Asignar boletos al usuario
        const { data: boletosDisponibles, } = await supabase
            .from("boletos")
            .select("id")
            .eq("sorteo_id", sorteo_id)
            .eq("estado", "disponible")
            .limit(cantidad_boletos);

        if (!boletosDisponibles || boletosDisponibles.length < cantidad_boletos) {
            throw new Error("No hay suficientes boletos disponibles");
        }

        const boletosIds = boletosDisponibles.map(boleto => boleto.id);

        // Actualizar estado de los boletos a "vendido"
        const { error: errorUpdateBoletos } = await supabase
            .from("boletos")
            .update({ estado: "vendido", usuario_id: usuario.id, pago_id: pago.id })
            .in("id", boletosIds);

        if (errorUpdateBoletos) {
            throw new Error("Error actualizando boletos");
        }

        // 5️⃣ Relacionar pago con boletos en 'boletos_pagos'
        const boletosPagosData = boletosIds.map(boleto_id => ({
            pago_id: pago.id,
            boleto_id
        }));

        const { error: errorInsertBoletosPagos } = await supabase
            .from("boletos_pagos")
            .insert(boletosPagosData);

        if (errorInsertBoletosPagos) {
            throw new Error("Error guardando relación de boletos y pago");
        }

        return NextResponse.json({ success: true, message: "Pago procesado correctamente" });
    } catch (error) {
        console.error("Error en webhook:", error);
        return NextResponse.json({ success: false, message: "Error procesando el pago" }, { status: 500 });
    }
}

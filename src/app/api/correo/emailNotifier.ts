import AWS from "aws-sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
AWS.config.update({ region: "us-east-1" });
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

supabase
    .channel("send_email")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "boletos" }, async (payload) => {
    const { correo, boletos } = payload.new;

    const emailParams = {
        Destination: { ToAddresses: [correo] },
        Message: {
            Body: { Text: { Data: `Tus boletos asignados son: ${boletos}` } },
            Subject: { Data: "🎟️ ¡Tus boletos han sido asignados!" },
            },
        Source: "tucorreo@tudominio.com",
    };

    try {
        await ses.sendEmail(emailParams).promise();
        console.log("✅ Correo enviado a:", correo);
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
    }
    })
    .subscribe();

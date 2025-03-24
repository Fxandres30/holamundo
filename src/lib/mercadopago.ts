import { MercadoPagoConfig } from "mercadopago";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
if (!ACCESS_TOKEN) throw new Error("⚠️ MERCADOPAGO_ACCESS_TOKEN no está definido.");

export const mercadopago = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

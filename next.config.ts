/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    },
  };
export default nextConfig;

const nextConfig = { 
  output: "standalone",
  env: {
    MP_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    MP_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID,
    MP_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET,
  },
};

export default nextConfig;

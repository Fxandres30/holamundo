const nextConfig = { 
  output: "standalone",
  turbo: {
    experimental: {
      externalDir: true, // Habilita la carga de paquetes externos
    },
  },
};

export default nextConfig;

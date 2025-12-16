/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Isso é crucial para o @sparticuz/chromium funcionar na Vercel
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
  eslint: {
    // Warning: Permite fazer build mesmo com erros de ESLint
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Aplica-se a todas as rotas dentro de /api
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Ou restrinja a um domínio específico: 'https://seu-dominio.com'
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, ngrok-skip-browser-warning",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

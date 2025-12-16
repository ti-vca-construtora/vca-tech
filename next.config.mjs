/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: Permite fazer build mesmo com erros de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

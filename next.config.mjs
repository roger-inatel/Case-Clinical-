/** @type {import('next').NextConfig} */
const nextConfig = {
  // ADR-0006: aplicação estática, sem servidor e sem LLM em runtime.
  // Este modo REMOVE Route Handlers, middleware e SSR — a restrição passa a ser
  // verificada pelo build, não por disciplina. Se alguém adicionar uma rota de
  // API, o build quebra. É intencional.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;

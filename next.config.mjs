/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 👈 核心：忽略所有 ESLint 错误
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 忽略 TS 错误
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig;

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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.cache = false;
    }
    return config;
  },
}

export default nextConfig;

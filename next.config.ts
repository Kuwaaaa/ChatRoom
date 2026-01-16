/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用严格模式以避免开发时双重渲染
  reactStrictMode: false,
  
  // 使用 Turbopack
  turbo: {},
  
  // 自定义服务器配置
  experimental: {
    serverExternalPackages: ['better-sqlite3'],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用严格模式以避免开发时双重渲染
  reactStrictMode: false,
  
  // 自定义服务器配置
  webpack: (config) => {
    // 忽略 better-sqlite3 的原生模块警告
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3',
    });
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 禁用自动语言检测，强制使用英语
  experimental: {
  },
  // 确保服务器端渲染时使用正确的语言设置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Language',
            value: 'en',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

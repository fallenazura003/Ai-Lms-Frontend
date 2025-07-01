// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/uploads/**', // Cho phép tải ảnh từ backend /uploads/
            },
            {
                protocol: 'http',
                hostname: '**', // Cho phép tải ảnh từ bất kỳ HTTP hostname nào (nếu dùng URL từ mạng)
            },
            {
                protocol: 'https',
                hostname: '**', // Cho phép tải ảnh từ bất kỳ HTTPS hostname nào (nếu dùng URL từ mạng)
            },
        ],
    },
};

export default nextConfig;
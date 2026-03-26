import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return [
      // API 프록시: /api/backend/api/v1/... → http://localhost:8080/api/v1/...
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
      // 업로드 파일 서빙: /uploads/... → http://localhost:8080/api/v1/uploads/files/...
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/api/v1/uploads/files/:path*`,
      },
    ];
  },
};

export default nextConfig;

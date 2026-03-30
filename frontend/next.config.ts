import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  ...(!isStaticExport && {
    async rewrites() {
      return [
        {
          source: "/api/v1/:path*",
          destination: "http://localhost:8080/api/v1/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;

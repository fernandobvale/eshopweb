import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "blog.superseo.com.br",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "web.archive.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "empresariadoweb.com.br",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

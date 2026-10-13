import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lineup & events live as sections on the home page; keep old links working
  async redirects() {
    return [
      { source: "/lineup", destination: "/#lineup", permanent: true },
      { source: "/events", destination: "/#events", permanent: true },
      { source: "/events/:slug", destination: "/#tickets", permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

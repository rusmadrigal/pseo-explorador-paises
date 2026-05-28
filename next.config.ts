import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/region/:region/pais/:slug/:tipo/:valor",
        destination: "/region/:region/:slug/:tipo/:valor",
        permanent: true,
      },
      {
        source: "/region/:region/pais/:slug",
        destination: "/region/:region/:slug",
        permanent: true,
      },
      {
        source: "/region/:region/pais",
        destination: "/region/:region",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "mainfacts.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;

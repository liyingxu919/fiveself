import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/xujiuying/Documents/oriental-aesthetic",
  },
  async rewrites() {
    return [
      {
        source: "/lottery",
        destination: "/lottery.html",
      },
    ];
  },
};

export default nextConfig;

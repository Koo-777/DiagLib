import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/diag-lib',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/diag-lib',
        basePath: false,
        permanent: false,
      },
    ]
  },
};

export default nextConfig;

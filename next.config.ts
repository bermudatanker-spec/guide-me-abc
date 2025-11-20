// next.config.ts

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },

  // ✅ Laat ESLint fouten/warnings de build NIET meer breken
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mediapipe/face_mesh', 'tensorflow'],
  },
  // Configure Turbopack for better performance
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => {
      // Existing webpack config if needed
      return config;
    },
  }),
};

export default withPWA(nextConfig, {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

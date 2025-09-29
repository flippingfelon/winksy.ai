import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mediapipe/face_mesh', 'tensorflow'],
  },
};

export default nextConfig;

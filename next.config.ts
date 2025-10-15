import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mediapipe/face_mesh', 'tensorflow'],
  // Skip static page generation at build time (pages will be rendered on-demand)
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
};

export default nextConfig;

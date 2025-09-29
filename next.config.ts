import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mediapipe/face_mesh', 'tensorflow'],
};

export default nextConfig;

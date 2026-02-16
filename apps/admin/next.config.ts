import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@packages/supabase', '@packages/ui'],
};

export default nextConfig;

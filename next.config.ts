import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Produces a self-contained .next/standalone build for the Docker
  // runtime stage. Vercel does its own file-tracing/bundling and doesn't
  // expect this — combining the two causes Vercel's build to fail looking
  // for .next/next-server.js.nft.json (standalone mode nests it under
  // .next/standalone/ instead). VERCEL is set automatically in every
  // Vercel build/runtime, so this needs no dashboard config on their end.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;

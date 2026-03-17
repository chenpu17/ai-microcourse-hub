import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  allowedDevOrigins: ["127.0.0.1"]
};

export default nextConfig;

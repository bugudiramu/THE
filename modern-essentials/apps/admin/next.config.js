/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@modern-essentials/types",
    "@modern-essentials/utils",
    "@modern-essentials/ui",
  ],
};

module.exports = nextConfig;

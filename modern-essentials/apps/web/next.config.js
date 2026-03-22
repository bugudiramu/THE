/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@modern-essentials/types", "@modern-essentials/utils"],
  images: {
    domains: ["images.unsplash.com"],
  },
};

module.exports = nextConfig;

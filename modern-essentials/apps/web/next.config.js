/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@modern-essentials/types", "@modern-essentials/utils", "@modern-essentials/ui"],
  images: {
    domains: ["images.unsplash.com", "plus.unsplash.com"],
  },
};

module.exports = nextConfig;

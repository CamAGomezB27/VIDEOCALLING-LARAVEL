/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.localhost",
    "localhost:3000",
  ],
};

module.exports = nextConfig;
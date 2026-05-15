/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "localhost",
    "*.localhost",
    "192.168.2.*",
  ],
};

module.exports = nextConfig;

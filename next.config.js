/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle API proxying in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  
  // Enable Turbopack
  turbopack: {},

};

module.exports = nextConfig;
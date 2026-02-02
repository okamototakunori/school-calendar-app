/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Vercelで公開する場合は basePath を空にする設定
  basePath: process.env.VERCEL ? '' : '/school-calendar-app',
};

module.exports = nextConfig;

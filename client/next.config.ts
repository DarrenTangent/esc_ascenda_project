// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'd2ey9sqrvkqdfs.cloudfront.net' },
      { protocol: 'https', hostname: 'cf.bstatic.com' },
      { protocol: 'https', hostname: 'pix8.agoda.net' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com' },
      { protocol: 'https', hostname: 'q-xx.bstatic.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};
module.exports = nextConfig;

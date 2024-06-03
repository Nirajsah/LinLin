/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'assets.website-files.com' }],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server routes (app/api/*) power the AI features, so deploy on Vercel (or any Node host).
  images: { unoptimized: true },
};
export default nextConfig;

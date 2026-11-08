/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // fully static: deploys to Vercel, Netlify or GitHub Pages
  images: { unoptimized: true },
};
export default nextConfig;

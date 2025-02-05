/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Required for static site generation
  // Disable image optimization since we're exporting static files
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

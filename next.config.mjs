/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Allow production builds with ESLint warnings (not errors)
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Allow production builds with TypeScript warnings (not errors)
        ignoreBuildErrors: false,
    },
    // Every next/image in the app loads a local /public file, so the image
    // optimizer allows no remote hosts. The previous `hostname: '**'` made
    // /_next/image an open proxy for any site. Add a specific host here if a
    // remote image is ever needed.
    images: {},
    // Optimize for Vercel deployment
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // swcMinify was removed in Next 15 (SWC minification is always on).
};

export default nextConfig;

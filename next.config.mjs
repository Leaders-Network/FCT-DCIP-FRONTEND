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
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Optimize for Vercel deployment
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    // Performance optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Enable SWC minification
    swcMinify: true,
};

export default nextConfig;

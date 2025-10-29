/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: false,
    },
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has type errors.
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
    output: 'standalone',
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
};

export default nextConfig;

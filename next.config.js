/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path((?!stockfish).*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                ],
            },
            {
                source: '/stockfish/stockfish.wasm',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/wasm',
                    },
                ],
            },
        ];
    },
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.wasm$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/',
                    name: '[name].[ext]',
                },
            },
            type: 'javascript/auto',
        });

        return config;
    }
};

module.exports = nextConfig;

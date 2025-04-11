/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add any other configurations you need
    webpack: (config) => {
        // Add regenerator-runtime to the alias configuration
        config.resolve.alias = {
            ...config.resolve.alias,
            'regenerator-runtime': require.resolve('regenerator-runtime'),
        };
        return config;
    },
};

module.exports = nextConfig; 
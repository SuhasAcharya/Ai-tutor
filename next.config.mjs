import { withTranspileModules } from 'next-transpile-modules';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add any other configurations you need (if any)
    webpack: (config, { isServer, webpack }) => {
        // Add this to ensure regenerator-runtime is properly included
        config.resolve.alias = {
            ...config.resolve.alias,
            'regenerator-runtime': require.resolve('regenerator-runtime'),
        };
        return config;
    },
}

// Export the config with transpilation for specific modules
export default withTranspileModules(['regenerator-runtime'])(nextConfig);
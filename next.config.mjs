import withTM from 'next-transpile-modules';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the node_modules directory
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add any other configurations you need (if any)
    webpack: (config) => {
        // Ensure regenerator-runtime is properly included
        config.resolve.alias = {
            ...config.resolve.alias,
            'regenerator-runtime': path.resolve(nodeModulesPath, 'regenerator-runtime'),
        };
        return config;
    },
}

// Export the config with transpilation for specific modules
export default withTM(['regenerator-runtime'])(nextConfig);
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // loadEnv reads .env files so the config itself can use them
    const env = loadEnv(mode, process.cwd(), '');
    const port = parseInt(env.VITE_PORT) || 5173;

    return {
        plugins: [react()],
        server: {
            port,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                },
                '/uploads': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                },
            },
        },
    };
});

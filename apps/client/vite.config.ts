import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, '../../') };
  return defineConfig({
    envDir: '../../',
    server: {
      port: parseInt(process.env['VITE_PORT']!) ?? 5173,
      proxy: {
        '/api/server/server_id': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.slice('/api/server/server_id/'.length),
        },
        '/api': {
          target: process.env['VITE_PROXY_TARGET'] || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      hmr: {
        clientPort: 443,
      },
    },
  });
};

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [tailwindcss(), react()],
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('/node_modules/')) return;
                    if (id.includes('/recharts/') || id.includes('/d3-')) return 'charts';
                    if (id.includes('/node_modules/motion/') || id.includes('/node_modules/motion-dom/') || id.includes('/node_modules/motion-utils/') || id.includes('/framer-motion/')) return 'motion';
                    if (id.includes('/antd/') || id.includes('/@ant-design/') || id.includes('/rc-') || id.includes('/@rc-component/')) return 'antd';
                    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-helmet-async/')) return 'react-vendor';
                },
            },
        },
    },
});
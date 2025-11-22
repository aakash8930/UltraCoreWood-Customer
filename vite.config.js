import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible'; // 1. Import this
import packageJson from './package.json' // Import your package.json

export default defineConfig({
  plugins: [react(),
  envCompatible()
  ],
  define: {
    // 1. Your existing version check (Keep this!)
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),

    // 2. FORCE the Razorpay Key here (Bypassing .env file)
    // Make sure to wrap the key in JSON.stringify!
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify("rzp_test_tKpg4G1mNvx22L"),
    
    // 3. FORCE the API URL here too (just in case)
    'import.meta.env.VITE_API_URL': JSON.stringify("http://localhost:8000"),
  },
  envPrefix: 'REACT_APP_',
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Forward API requests to your backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Forward Socket.io connections
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
});



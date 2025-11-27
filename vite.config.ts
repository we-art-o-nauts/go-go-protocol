
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          game: ['./src/game.ts', './src/entities.ts', './src/ui.ts']
        }
      }
    }
  },
  optimizeDeps: {
  },
  define: {
    __GAME_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})

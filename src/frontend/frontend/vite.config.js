import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {

    host: true, // или '0.0.0.0' - слушать все сетевые интерфейсы[reference:0]
    port: 3000, // порт, на котором работает ваш фронтенд
    // Убедитесь, что прокси настроен правильно, если вы его используете
    proxy: {
      '/graphql': {
        target: 'http://localhost:8080', // Важно: это адрес, по которому Vite видит бэкенд (пока что локальный)
        changeOrigin: true,
      }
    },
    hmr: {
      overlay: false
    }
  }
})

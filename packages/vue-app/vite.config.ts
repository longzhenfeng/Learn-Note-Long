import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 移动端适配配置
  base: './', // 使用相对路径，确保在 WebView 中资源加载正确
  server: {
    host: '0.0.0.0', // 允许外部访问，用于真机调试
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // 确保资源文件使用相对路径
    assetsDir: 'assets',
  },
})

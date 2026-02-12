# Vite 配置技巧

## 基础配置

### 1. 路径别名配置

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  }
})
```

### 2. 环境变量配置

在项目根目录创建环境变量文件：

```bash
# .env                # 所有环境都会加载
# .env.development    # 开发环境
# .env.production     # 生产环境
# .env.test           # 测试环境
```

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  // 根据不同环境加载不同配置
  return {
    define: {
      'import.meta.env.MODE': JSON.stringify(mode),
    }
  }
})
```

### 3. 开发服务器配置

```typescript
export default defineConfig({
  server: {
    port: 3000,              // 端口号
    host: true,              // 监听所有地址
    open: true,              // 自动打开浏览器
    cors: true,              // 启用 CORS
    proxy: {                 // 代理配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 高级配置

### 4. 构建优化配置

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',                    // 输出目录
    assetsDir: 'assets',               // 静态资源目录
    sourcemap: false,                  // 是否生成 sourcemap
    minify: 'terser',                  // 压缩器：terser 或 esbuild
    chunkSizeWarningLimit: 1000,       // chunk 大小警告阈值（KB）
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-library': ['element-plus']
        },
        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true,            // 删除 console
        drop_debugger: true            // 删除 debugger
      }
    }
  }
})
```

### 5. CSS 配置

```typescript
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',    // 类名转换方式
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        }
      }
    },
    devSourcemap: true
  }
})
```

### 6. 插件配置

```typescript
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    }),
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    })
  ]
})
```

### 7. 依赖优化配置

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['vue', 'vue-router'],    // 预构建依赖
    exclude: ['your-local-package'],   // 排除某些依赖
    force: false,                      // 强制重新预构建
  }
})
```

### 8. 多页面应用配置

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about.html'),
        contact: path.resolve(__dirname, 'contact.html'),
      }
    }
  }
})
```

### 9. 条件配置

```typescript
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // 开发环境特定配置
    return {
      server: {
        open: true
      }
    }
  } else {
    // 生产环境特定配置
    return {
      build: {
        minify: 'terser'
      }
    }
  }
})
```

## 实用配置技巧

### 10. CDN 外部资源配置

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

### 11. 静态资源处理

```typescript
export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.glb'],  // 额外的资源类型
  publicDir: 'public',                       // 静态资源目录
})
```

### 12. 开发工具配置

```typescript
export default defineConfig({
  // 清屏输出
  clearScreen: false,
  // 日志级别
  logLevel: 'info',
  // 覆盖默认的 index.html
  // 在某些场景下很有用
  // appType: 'custom'
})
```

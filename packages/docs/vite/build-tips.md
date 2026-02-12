# Vite 构建优化技巧

## 构建配置优化

### 1. 分包策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: (id) => {
          // 将 node_modules 中的包单独打包
          if (id.includes('node_modules')) {
            // Vue 相关
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            // UI 组件库
            if (id.includes('element-plus') || id.includes('ant-design')) {
              return 'ui-vendor'
            }
            // 工具库
            if (id.includes('lodash') || id.includes('axios')) {
              return 'utils-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
        },
        // 文件命名规则
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].[ext]`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].[ext]`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].[ext]`
          }
          return `${ext}/[name]-[hash].[ext]`
        }
      }
    }
  }
})
```

### 2. 代码压缩优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',  // 使用 terser 压缩（比 esbuild 更彻底）
    terserOptions: {
      compress: {
        drop_console: true,        // 删除 console
        drop_debugger: true,        // 删除 debugger
        pure_funcs: ['console.log'] // 删除特定函数
      },
      format: {
        comments: false            // 删除注释
      }
    }
  }
})
```

### 3. 构建产物分析

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',    // 分析报告文件名
      open: true,                     // 构建完成后自动打开
      gzipSize: true,                 // 显示 gzip 大小
      brotliSize: true,               // 显示 brotli 大小
      template: 'treemap'             // 图表类型：treemap、sunburst、network
    })
  ]
})
```

### 4. 压缩静态资源

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,              // 大于 10kb 才压缩
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // Brotli 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

## 性能优化

### 5. Tree Shaking 优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: {
        // 更激进的 tree shaking
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    }
  }
})
```

### 6. CDN 加速

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'axios'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios'
        }
      }
    }
  }
})
```

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@4/dist/vue-router.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

### 7. 预加载关键资源

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 预加载入口 chunk
        manualChunks: {
          'main': ['./src/main.ts']
        }
      }
    }
  }
})
```

```html
<!-- index.html -->
<link rel="modulepreload" href="/assets/main-[hash].js">
<link rel="modulepreload" href="/assets/vue-vendor-[hash].js">
```

### 8. 按需引入优化

```typescript
// 使用 unplugin-vue-components 自动按需引入
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass'  // 按需引入样式
        })
      ]
    })
  ]
})
```

### 9. 图片优化

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
})
```

### 10. CSS 优化

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    // 开启 CSS 代码分割
    modules: {
      scopeBehaviour: 'local'
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  },
  build: {
    cssCodeSplit: true  // 启用 CSS 代码分割
  }
})
```

## 构建效率优化

### 11. 并行构建

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 并行处理
    parallel: true,
    // 限制 chunk 大小
    chunkSizeWarningLimit: 1000
  }
})
```

### 12. 缓存配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 缓存目录
    cacheDir: 'node_modules/.vite',
    // 使用持久化缓存
    rollupOptions: {
      cache: true
    }
  }
})
```

### 13. 增量构建

```typescript
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:watch": "vite build --watch"
  }
}
```

## 部署优化

### 14. 生成 PWA

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'My App',
        short_name: 'My App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

### 15. 多环境构建

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    base: isProduction ? '/production-path/' : '/',
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false
    }
  }
})
```

```bash
# package.json
{
  "scripts": {
    "build:dev": "vite build --mode development",
    "build:test": "vite build --mode test",
    "build:prod": "vite build --mode production"
  }
}
```

### 16. SSR 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    ssr: true,  // 构建 SSR 入口
    outDir: 'dist/server',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
```

## 构建检查

### 17. 构建大小检查

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略某些警告
        if (warning.code === 'MODULE_NOT_FOUND') return
        warn(warning)
      }
    }
  },
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true
    })
  ]
})
```

### 18. 构建后处理

```javascript
// scripts/post-build.js
import fs from 'fs'
import path from 'path'

const distPath = path.resolve(process.cwd(), 'dist')

// 删除不需要的文件
const filesToDelete = [
  'stats.html',
  'stats.json'
]

filesToDelete.forEach(file => {
  const filePath = path.join(distPath, file)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
})

// 生成版本信息
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
)

const versionInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  gitHash: process.env.GIT_HASH || 'unknown'
}

fs.writeFileSync(
  path.join(distPath, 'version.json'),
  JSON.stringify(versionInfo, null, 2)
)
```

```json
// package.json
{
  "scripts": {
    "build": "vite build && node scripts/post-build.js"
  }
}
```

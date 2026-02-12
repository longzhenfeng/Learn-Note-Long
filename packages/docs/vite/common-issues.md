# Vite 常见问题与解决方案

## 启动问题

### 1. 端口被占用

**问题：**
```
Error: Port 3000 is already in use
```

**解决方案：**

```bash
# 方案一：指定其他端口
vite --port 3001

# 方案二：自动查找可用端口
vite --port 0
```

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3001,
    strictPort: false  // 如果端口被占用，自动尝试下一个端口
  }
})
```

### 2. HMR 不工作

**问题：** 修改代码后页面没有自动更新

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true  // 显示错误覆盖层
    },
    watch: {
      usePolling: true  // 使用轮询（在某些网络环境下需要）
    }
  }
})
```

### 3. 依赖预构建失败

**问题：**
```
Error: Pre-dependency optimization failed
```

**解决方案：**

```bash
# 清除缓存并重新启动
rm -rf node_modules/.vite
vite --force
```

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    force: true  // 强制重新预构建
  }
})
```

## 构建问题

### 4. 构建后空白页

**问题：** 构建成功但访问页面是空白

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  base: './',  // 使用相对路径
  // 或指定正确的部署路径
  base: '/your-subpath/'
})
```

```html
<!-- 确保 index.html 中的路径正确 -->
<script type="module" src="/src/main.ts"></script>
```

### 5. 动态导入失败

**问题：** 动态导入的模块在构建后找不到

**解决方案：**

```typescript
// 使用明确的路径
const module = await import('@/components/MyComponent.vue')

// 避免使用变量路径
// ❌ 错误
const moduleName = 'MyComponent'
const module = await import(`@/components/${moduleName}.vue`)

// ✅ 正确 - 使用 import.meta.glob
const modules = import.meta.glob('@/components/*.vue')
const module = await modules[`/src/components/${moduleName}.vue`]()
```

### 6. 内存溢出

**问题：**
```
JavaScript heap out of memory
```

**解决方案：**

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" vite build
```

```json
// package.json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 node_modules/vite/bin/vite.js build"
  }
}
```

## 样式问题

### 7. 样式不生效

**问题：** CSS 样式没有正确应用

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      // 确保 CSS Modules 配置正确
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        // 确保全局变量正确引入
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

### 8. PostCSS 配置不生效

**问题：** PostCSS 插件没有正常工作

**解决方案：**

```javascript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    cssnano: {}
  }
}
```

```typescript
// 或在 vite.config.ts 中配置
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  }
})
```

## 类型问题

### 9. TypeScript 类型错误

**问题：** import.meta.env 类型提示错误

**解决方案：**

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 10. Vue 组件类型错误

**问题：** Vue 组件导入类型不正确

**解决方案：**

```typescript
// vite.config.ts
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ]
})
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "types": ["vite/client"]
  }
}
```

## 资源问题

### 11. 图片路径错误

**问题：** 图片资源在构建后找不到

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop()
          return `assets/${ext}/[name]-[hash].[ext]`
        }
      }
    }
  }
})
```

```vue
<template>
  <!-- 使用相对路径 -->
  <img src="/images/logo.png" alt="Logo" />

  <!-- 或使用 import 导入 -->
  <img :src="logoImage" alt="Logo" />
</template>

<script setup>
import logoImage from '@/assets/images/logo.png'
</script>
```

### 12. 字体文件不加载

**问题：** 自定义字体文件无法加载

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})
```

```css
/* 确保字体路径正确 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
}
```

## 性能问题

### 13. 首屏加载慢

**问题：** 应用首次加载时间过长

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 合理分包
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```

```typescript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]
```

### 14. 开发环境卡顿

**问题：** 开发时页面响应慢

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // 减少文件监听
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  },
  optimizeDeps: {
    // 预构建常用依赖
    include: ['vue', 'vue-router', 'pinia']
  }
})
```

## 兼容性问题

### 15. 旧浏览器不兼容

**问题：** 在旧浏览器中运行报错

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: ['es2015', 'chrome58', 'firefox57', 'safari11'],
    polyfillDynamicImport: true
  }
})
```

```bash
# 安装 @vitejs/plugin-legacy
npm install @vitejs/plugin-legacy -D
```

```typescript
// vite.config.ts
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

### 16. SSR 构建问题

**问题：** 服务端渲染构建失败

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      output: {
        // 排除浏览器专用依赖
        external: ['some-browser-only-lib']
      }
    }
  }
})
```

## 调试技巧

### 17. 查看构建信息

```bash
# 详细构建日志
vite build --debug

# 查看预构建信息
vite --debug
```

### 18. 使用 Source Map 调试

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true  // 生产环境也生成 sourcemap
  }
})
```

## 最佳实践

### 19. 项目结构建议

```
my-project/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 资源文件
│   ├── components/      # 组件
│   ├── views/           # 页面
│   ├── router/          # 路由
│   ├── stores/          # 状态管理
│   ├── utils/           # 工具函数
│   ├── styles/          # 全局样式
│   ├── App.vue
│   └── main.ts
├── .env                 # 环境变量
├── .env.development
├── .env.production
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tsconfig.node.json
```

### 20. 常用命令别名

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:analyze": "vite build && npx vite-bundle-visualizer",
    "clean": "rm -rf dist node_modules/.vite"
  }
}
```

### 21. 性能检查清单

- [ ] 启用了代码分割
- [ ] 配置了合理的分包策略
- [ ] 使用了路由懒加载
- [ ] 图片资源已优化
- [ ] 启用了 Gzip/Brotli 压缩
- [ ] 配置了 CDN 加速
- [ ] 使用了 Tree Shaking
- [ ] 删除了未使用的代码
- [ ] 优化了第三方库引入
- [ ] 配置了浏览器缓存策略

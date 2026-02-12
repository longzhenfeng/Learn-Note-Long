# Vite 开发技巧

## 开发体验优化

### 1. 快速启动开发服务器

```bash
# 指定端口
vite --port 4000

# 指定主机
vite --host

# 打开浏览器
vite --open

# HTTPS 模式
vite --https

# 组合使用
vite --port 4000 --host --open
```

### 2. 热模块替换（HMR）API

```typescript
// main.ts
if (import.meta.hot) {
  // 接受模块更新
  import.meta.hot.accept('./module', (newModule) => {
    console.log('模块已更新', newModule)
  })

  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    console.log('自身已更新', newModule)
  })

  // 丢弃模块状态
  import.meta.hot.dispose((data) => {
    // 清理工作
    console.log('模块即将被替换')
  })

  // 注入数据到新模块
  import.meta.hot.data = { someData: 'value' }
}
```

### 3. 环境变量使用

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=开发环境

// .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=生产环境

// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// TypeScript 类型声明
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}
```

### 4. 动态导入

```typescript
// 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// 条件导入
async function loadModule() {
  if (condition) {
    const module = await import('@/utils/heavy-module')
    module.doSomething()
  }
}

// 命名导出
const { default: Component, helper } = await import('@/components/MyComponent')
```

## 调试技巧

### 5. 源码映射（Source Map）

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    devSourcemap: true  // CSS 源码映射
  },
  build: {
    sourcemap: true     // JS 源码映射
  }
})
```

### 6. 性能分析

```bash
# 安装 rollup-plugin-visualizer
npm install rollup-plugin-visualizer -D
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### 7. 调试 Vite 本身

```bash
# 启用调试模式
DEBUG=vite:* vite

# 查看预构建信息
vite --debug
```

## 开发工具集成

### 8. VS Code 配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 9. TypeScript 类型提示

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 10. 自动导入配置

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'axios': [
            ['default', 'axios']
          ]
        }
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    })
  ]
})
```

## 实用开发技巧

### 11. 虚拟模块

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'virtual-module',
      resolveId(id) {
        if (id === 'virtual:my-module') {
          return '\0virtual:my-module'
        }
      },
      load(id) {
        if (id === '\0virtual:my-module') {
          return 'export const message = "Hello from virtual module!"'
        }
      }
    }
  ]
})

// 使用
import { message } from 'virtual:my-module'
```

### 12. 全局样式注入

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `
      }
    }
  }
})
```

### 13. SVG 组件化

```typescript
// vite.config.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__'
    })
  ]
})
```

### 14. Mock 数据

```typescript
// vite.config.ts
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: true
    })
  ]
})
```

```typescript
// mock/user.ts
export default [
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ query }) => {
      return {
        code: 200,
        data: {
          id: 1,
          name: '张三'
        }
      }
    }
  }
]
```

### 15. 开发环境代理

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // 代理到后端 API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true
      },
      // 多个代理
      '/api1': {
        target: 'http://api1.example.com',
        changeOrigin: true
      },
      '/api2': {
        target: 'http://api2.example.com',
        changeOrigin: true
      }
    }
  }
})
```

## 性能优化技巧

### 16. 依赖预构建

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: ['lodash-es'],
    // 排除某些依赖
    exclude: ['some-esm-only-package'],
    // 自定义 esbuild 选项
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
```

### 17. 按需加载

```typescript
// 组件按需加载
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

// 带加载状态的异步组件
const AsyncComponentWithLoading = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 18. 图片懒加载

```vue
<template>
  <img v-lazy="imageUrl" alt="description" />
</template>

<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const vLazy = {
  mounted(el, binding) {
    const { stop } = useIntersectionObserver(
      el,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          el.src = binding.value
          stop()
        }
      }
    )
  }
}
</script>
```

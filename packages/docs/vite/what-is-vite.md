# Vite 是什么

Vite 是一个新一代的前端构建工具，由 Vue.js 的作者尤雨溪开发。

## 核心特性

### 1. 极速的服务启动
- 利用浏览器原生 ES 模块（ESM）能力，无需打包
- 按需编译，只编译当前请求的模块
- 冷启动速度比传统构建工具快 10-100 倍

### 2. 即时的热模块更新（HMR）
- 无论应用大小，HMR 始终保持快速
- 保持应用状态的同时更新模块
- 性能不受模块数量影响

### 3. 丰富的功能特性
- TypeScript / JSX 支持
- CSS 预处理器支持（Sass、Less、Stylus）
- CSS Modules
- PostCSS
- 支持 Web Components
- 图片和字体资源处理

## 与传统构建工具对比

| 特性 | Vite | Webpack |
|------|------|---------|
| 开发启动速度 | 极快（秒级） | 较慢（分钟级） |
| 热更新速度 | 毫秒级 | 秒级 |
| 配置复杂度 | 简单 | 复杂 |
| 生产构建 | 使用 Rollup | 自身 |
| 生态成熟度 | 快速成长 | 非常成熟 |

## 适用场景

- ✅ Vue/React 项目开发
- ✅ 需要快速原型开发
- ✅ 追求极致的开发体验
- ✅ 中小型项目构建
- ⚠️ 超大型项目可能需要更多配置优化

## 生态系统

Vite 拥有丰富的插件生态，可以通过插件扩展功能：
- `@vitejs/plugin-vue` - Vue 3 支持
- `@vitejs/plugin-react` - React 支持
- `vite-plugin-svgr` - SVG 组件化
- `vite-plugin-windicss` - Windi CSS 支持
- 等等...

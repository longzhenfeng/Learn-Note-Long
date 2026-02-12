# 主题自定义

本项目使用自定义的 Cyber Wave 主题，基于 VitePress 默认主题扩展。

## 主题架构

```
packages/docs/.vitepress/
├── theme/
│   ├── index.ts          # 主题入口
│   └── custom.css        # 自定义样式
├── config.mts            # VitePress 配置
└── public/
    ├── favicon.svg       # 网站图标
    └── logo.svg          # Logo 图片
```

## Cyber Wave 主题

### 配色方案

#### 亮色模式
```css
--vp-c-brand-1: #00e5ff;   /* 主色 - 明亮青色 */
--vp-c-brand-2: #00bcd4;   /* 次要色 */
--vp-c-brand-3: #0097a7;   /* 辅助色 */
--vp-c-bg: #ffffff;        /* 背景色 */
```

#### 暗色模式
```css
--vp-c-brand-1: #00e5ff;   /* 主色 */
--vp-c-bg: #0a1e28;        /* 深蓝绿背景 */
--vp-c-bg-alt: #0d2433;    /* 次要背景 */
--vp-c-text-1: #e0f7fa;    /* 主要文字 */
```

### 视觉特效

1. **卡片悬停效果**
   - 上浮动画
   - 青色光晕阴影

2. **Hero 图标动画**
   - 浮动效果
   - 发光阴影

3. **毛玻璃效果**
   - 导航栏背景模糊
   - 半透明遮罩

4. **自定义滚动条**
   - 青色滚动条
   - 圆角样式

## 修改主题颜色

### 更改品牌色

编辑 `packages/docs/.vitepress/theme/custom.css`:

```css
:root {
  /* 修改主色调 */
  --vp-c-brand-1: #your-color;
  --vp-c-brand-2: #your-color;
  --vp-c-brand-3: #your-color;
}

.dark {
  /* 暗色模式 */
  --vp-c-brand-1: #your-dark-color;
}
```

### 更改背景色

```css
:root {
  --vp-c-bg: #ffffff;
  --vp-c-bg-alt: #f5f5f5;
}

.dark {
  --vp-c-bg: #0a1e28;
  --vp-c-bg-alt: #0d2433;
}
```

## 自定义 Logo

### 替换 Logo 文件

将你的 Logo 文件放到 `packages/docs/public/` 目录：

```
public/
├── logo.svg      # Hero 区域大 Logo
└── favicon.svg   # 浏览器标签页小图标
```

### 配置 Logo

编辑 `packages/docs/.vitepress/config.mts`:

```typescript
export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',  // 导航栏 Logo
    // ...
  }
})
```

## 修改首页

编辑 `packages/docs/index.md`:

```markdown
---
layout: home

hero:
  name: "你的标题"
  text: "副标题"
  tagline: 说明文字
  image:
    src: /logo.svg
    alt: Logo 描述
  actions:
    - theme: brand
      text: 按钮文字
      link: /path/to/page

features:
  - icon: 🎨
    title: 特性标题
    details: 特性描述
    link: /path/to/doc
---
```

## 添加自定义样式

### 方法一：修改 custom.css

在 `packages/docs/.vitepress/theme/custom.css` 中添加：

```css
/* 自定义样式 */
.my-custom-class {
  /* 你的样式 */
}
```

### 方法二：创建新的 CSS 文件

1. 创建 `packages/docs/.vitepress/theme/my-styles.css`
2. 在 `theme/index.ts` 中导入：

```typescript
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './my-styles.css'  // 导入新样式

export default {
  extends: DefaultTheme,
  // ...
}
```

## 添加自定义组件

### 1. 创建 Vue 组件

在 `packages/docs/.vitepress/theme/components/` 创建组件：

```vue
<!-- MyComponent.vue -->
<template>
  <div class="my-component">
    <slot />
  </div>
</template>

<style scoped>
.my-component {
  /* 组件样式 */
}
</style>
```

### 2. 注册全局组件

编辑 `theme/index.ts`:

```typescript
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './components/MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {})
  },
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  }
}
```

### 3. 在 Markdown 中使用

```markdown
# 我的文档

<MyComponent>
  内容
</MyComponent>
```

## 切换到其他主题

### 使用 VitePress 默认主题

删除或重命名 `theme` 目录，VitePress 会自动使用默认主题。

### 使用社区主题

1. 安装主题包：
   ```bash
   pnpm add -D vitepress-theme-xxx
   ```

2. 修改 `theme/index.ts`:
   ```typescript
   import Theme from 'vitepress-theme-xxx'
   
   export default Theme
   ```

## CSS 变量参考

### 颜色变量

```css
--vp-c-brand-1         /* 主品牌色 */
--vp-c-brand-2         /* 次要品牌色 */
--vp-c-brand-3         /* 辅助品牌色 */
--vp-c-brand-soft      /* 柔和品牌色 */

--vp-c-bg              /* 主背景色 */
--vp-c-bg-alt          /* 次要背景色 */
--vp-c-bg-elv          /* 浮层背景色 */
--vp-c-bg-soft         /* 柔和背景色 */

--vp-c-text-1          /* 主要文字 */
--vp-c-text-2          /* 次要文字 */
--vp-c-text-3          /* 辅助文字 */

--vp-c-border          /* 边框色 */
--vp-c-divider         /* 分割线色 */
```

### 布局变量

```css
--vp-layout-max-width  /* 内容最大宽度 */
--vp-nav-height        /* 导航栏高度 */
--vp-sidebar-width     /* 侧边栏宽度 */
```

### 字体变量

```css
--vp-font-family-base  /* 基础字体 */
--vp-font-family-mono  /* 等宽字体 */
```

## 调试技巧

### 使用浏览器开发者工具

1. 打开浏览器开发者工具（F12）
2. 检查元素找到对应的 CSS 类名
3. 在 `custom.css` 中覆盖样式

### 热更新

运行 `pnpm docs:dev` 时，CSS 修改会自动热更新，无需重启服务器。

## 参考资源

- [VitePress 官方文档](https://vitepress.dev/)
- [VitePress 主题配置](https://vitepress.dev/reference/default-theme-config)
- [VitePress CSS 变量](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css)

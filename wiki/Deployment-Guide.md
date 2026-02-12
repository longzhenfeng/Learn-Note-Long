# 部署指南

本项目使用 GitHub Pages 和 GitHub Actions 实现自动化部署。

## 部署架构

```
本地开发 → Git Push → GitHub Actions → 构建 → GitHub Pages
```

## 自动化部署

### 工作流程

1. **推送代码到 master 分支**
   ```bash
   git add .
   git commit -m "your message"
   git push
   ```

2. **GitHub Actions 自动触发**
   - 检出代码
   - 安装 Node.js 和 pnpm
   - 安装依赖
   - 构建文档

3. **自动发布到 gh-pages 分支**
   - 使用 `peaceiris/actions-gh-pages` 
   - 将构建产物推送到 `gh-pages` 分支

4. **GitHub Pages 自动更新**
   - 网站地址: https://longzhenfeng.github.io/Learn-Note-Long/

### GitHub Actions 配置

配置文件位置: `.github/workflows/deploy-docs.yml`

```yaml
name: Deploy Docs to GitHub Pages

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: pnpm docs:build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: './packages/docs/.vitepress/dist'
```

## GitHub Pages 设置

### 初次配置

1. 进入仓库的 **Settings** → **Pages**
2. **Source** 选择 "Deploy from a branch"
3. **Branch** 选择 `gh-pages` 和 `/ (root)`
4. 点击 **Save**

### 权限配置

1. 进入 **Settings** → **Actions** → **General**
2. 找到 "Workflow permissions"
3. 选择 **"Read and write permissions"**
4. 勾选 **"Allow GitHub Actions to create and approve pull requests"**
5. 点击 **Save**

## VitePress 配置

### Base Path 配置

由于部署在子路径下，需要配置 `base` 路径：

```typescript
// packages/docs/.vitepress/config.mts
export default defineConfig({
  base: '/Learn-Note-Long/',
  // ... 其他配置
})
```

## 手动部署

如果需要手动触发部署：

### 方式一：通过 GitHub 界面

1. 进入仓库的 **Actions** 页面
2. 选择 "Deploy Docs to GitHub Pages" 工作流
3. 点击 **Run workflow**
4. 选择 `master` 分支
5. 点击 **Run workflow** 按钮

### 方式二：本地构建并推送

```bash
# 1. 构建文档
pnpm docs:build

# 2. 进入构建产物目录
cd packages/docs/.vitepress/dist

# 3. 初始化 git（如果是首次）
git init
git add -A
git commit -m 'deploy'

# 4. 推送到 gh-pages 分支
git push -f git@github.com:longzhenfeng/Learn-Note-Long.git master:gh-pages

# 5. 返回项目根目录
cd -
```

## 部署到其他平台

### Vercel

1. 导入 GitHub 仓库
2. 配置构建设置：
   - **Framework Preset**: VitePress
   - **Root Directory**: `packages/docs`
   - **Build Command**: `pnpm docs:build`
   - **Output Directory**: `.vitepress/dist`

### Netlify

1. 导入 GitHub 仓库
2. 配置构建设置：
   - **Base directory**: `packages/docs`
   - **Build command**: `pnpm docs:build`
   - **Publish directory**: `packages/docs/.vitepress/dist`

## 自定义域名

### GitHub Pages

1. 在仓库 **Settings** → **Pages** 中找到 "Custom domain"
2. 输入你的域名（如 `docs.example.com`）
3. 在域名 DNS 设置中添加 CNAME 记录：
   ```
   CNAME: docs -> longzhenfeng.github.io
   ```

### VitePress 配置

如果使用自定义域名，需要更新 `base` 配置：

```typescript
export default defineConfig({
  base: '/', // 使用根路径
  // ... 其他配置
})
```

## 部署检查

### 查看部署状态

- **GitHub Actions**: 仓库 → Actions 页面
- **部署日志**: 点击具体的工作流运行查看详细日志
- **部署历史**: Settings → Pages → Build and deployment

### 常见问题

#### 样式或资源 404

检查 `base` 配置是否正确：
- 子路径部署: `base: '/仓库名/'`
- 根路径部署: `base: '/'`

#### 构建失败

查看 Actions 日志，常见原因：
- 依赖安装失败
- 构建命令错误
- Node.js 版本不匹配

## 回滚部署

如果需要回滚到之前的版本：

1. 找到工作的 commit
2. 重新推送：
   ```bash
   git revert <commit-hash>
   git push
   ```

或者手动触发之前成功的工作流。

# 快速开始

本指南将帮助你在本地运行 Learn Note Long 项目。

## 环境要求

- **Node.js**: v18.x 或更高版本
- **pnpm**: v10.x 或更高版本
- **Git**: 用于克隆仓库

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/longzhenfeng/Learn-Note-Long.git
cd Learn-Note-Long
```

### 2. 安装依赖

项目使用 pnpm 作为包管理器：

```bash
pnpm install
```

### 3. 运行文档开发服务器

```bash
pnpm docs:dev
```

文档网站将在 `http://localhost:5173` 启动（端口号可能不同）。

### 4. 运行其他项目

项目是一个 monorepo，包含多个子项目：

#### Express 应用

```bash
# 开发模式
pnpm express:dev

# 生产模式
pnpm express:start
```

#### Vue 应用

```bash
pnpm vue:dev
```

#### 数据库相关

```bash
# 启动数据库
pnpm db:start

# 数据库管理界面
pnpm db:view
```

## 项目结构

```
Learn-Note-Long/
├── packages/
│   ├── docs/              # VitePress 文档
│   ├── express-app/       # Express 后端应用
│   └── vue-app/           # Vue 前端应用
├── .github/
│   └── workflows/         # GitHub Actions 配置
├── package.json           # 根项目配置
└── pnpm-workspace.yaml    # pnpm workspace 配置
```

## 构建项目

### 构建文档

```bash
pnpm docs:build
```

构建产物将生成在 `packages/docs/.vitepress/dist` 目录。

### 预览构建结果

```bash
pnpm docs:preview
```

## 常见问题

### pnpm 命令找不到

如果没有安装 pnpm，可以通过以下方式安装：

```bash
npm install -g pnpm
```

### Node 版本不匹配

项目根目录有 `.nvmrc` 文件，如果使用 nvm，可以运行：

```bash
nvm use
```

### 端口被占用

如果默认端口被占用，VitePress 会自动使用其他端口。查看终端输出获取实际端口号。

## 下一步

- 查看 [部署指南](Deployment-Guide) 了解如何部署项目
- 浏览 [主题自定义](Theme-Customization) 学习如何定制主题
- 返回 [Wiki 首页](Home) 查看更多文档

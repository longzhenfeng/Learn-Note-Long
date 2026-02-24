# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

学习笔记和实验项目的 Monorepo，使用 pnpm workspace + Turborepo 管理三个子包：

- **packages/docs** — VitePress 文档站点（部署到 GitHub Pages）
- **packages/express-app** — Express + TypeScript 后端 API
- **packages/vue-app** — Vue 3 + TypeScript 前端（端口 3001）

Node 版本要求：18.20.8（见 `.nvmrc`）

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动各子包开发服务器
pnpm docs:dev          # VitePress 文档
pnpm express:dev       # Express API（tsx watch，端口 3000）
pnpm vue:dev           # Vue 前端（Vite，端口 3001）

# 构建
pnpm build             # 构建所有包
pnpm docs:build        # 仅构建文档
pnpm express:build     # 仅构建 Express（tsc）
pnpm vue:build         # 仅构建 Vue（vue-tsc + vite build）

# 数据库（express-app）
pnpm db:start          # 启动本地 MongoDB（内置 macOS 二进制）
pnpm db:view           # 查看 MongoDB 数据

# MySQL 通过 Docker 运行
docker compose -f packages/express-app/docker-compose.yml up -d

# Sequelize 迁移（在 packages/express-app 目录下执行）
pnpm db:migrate              # 执行迁移
pnpm db:migrate:status       # 查看迁移状态
pnpm db:migrate:undo         # 回滚上一个迁移
pnpm db:seed                 # 执行所有种子数据

# 给特定包添加依赖
pnpm --filter express-app add <package>
pnpm --filter docs add -D <package>
```

## 架构要点

### 双数据库设计（express-app）

express-app 同时使用两个数据库：

- **MongoDB**（Mongoose）— 用于用户模块（`src/models/User.ts`，`src/routes/userRoutes.ts`）。连接地址 `mongodb://127.0.0.1:27017/express-app`，数据存储在 `mongodb-data/` 目录。
- **MySQL**（Sequelize）— 用于管理后台模块（文章等）。路由在 `src/routes/admin/`，模型定义在根级 `models/` 目录（非 `src/models/`）。连接配置在 `config/config.json` 和 `src/config/database.ts`。

注意：Mongoose 模型在 `src/models/`，Sequelize 模型在项目根级 `models/` 目录——两者路径不同。

### Sequelize 配置

- `.sequelizerc.cjs` 使用 CommonJS 格式（项目本身是 ESM `"type": "module"`）
- 迁移文件和种子文件也使用 `.cjs` 后缀
- Sequelize 模型使用动态导入方式在 `models/index.ts` 中加载

### API 响应规范

统一的响应工具在 `src/utils/response.ts`：
- `successResponse(res, message, data, code)` — 成功响应
- `failureResponse(res, err)` — 失败响应，自动处理 `SequelizeValidationError` 和 `NotFoundError`

管理后台路由（如 `src/routes/admin/article.ts`）使用这套工具；用户路由（`userRoutes.ts`）目前手动构建响应。

### 前后端通信

vue-app 通过 axios 调用 express-app API，基础 URL 硬编码为 `http://localhost:3000/api`（见 `src/services/api.ts`）。

### 文档部署

VitePress 文档通过 GitHub Actions（`.github/workflows/deploy-docs.yml`）或手动脚本（`packages/docs/deploy.sh`）部署到 GitHub Pages，base path 为 `/Learn-Note-Long/`。

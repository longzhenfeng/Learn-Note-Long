# Learn-Note-Long

学习笔记和实验项目的 Monorepo 仓库。

## 项目结构

```
packages/
├── docs/           # VitePress 文档站点
└── express-app/    # Express + TypeScript 学习项目
└── vue-app/        # Vue + TypeScript 学习项目
└── mongodb/        # MongoDB 学习项目
```

## 快速开始

```bash
# 安装所有依赖
pnpm install

# 启动文档开发服务器
pnpm docs:dev

# 启动 Express 开发服务器
pnpm express:dev

# 启动 Vue 开发服务器
pnpm vue:dev

# 启动 MongoDB
pnpm db:start

# 查看数据库内容
pnpm db:view
```

## 命令参考

| 命令 | 描述 |
|------|------|
| `pnpm docs:dev` | 启动文档开发服务器 |
| `pnpm express:dev` | 启动 Express 开发服务器 (热重载) |
| `pnpm vue:dev` | 启动 Vue 前端 (端口 3001) |
| `pnpm db:start` | 启动本地 MongoDB |
| `pnpm db:view` | 查看数据库内容 |

## 添加依赖

```bash
# 给特定包添加依赖
pnpm --filter express-app add <package>
pnpm --filter docs add -D <package>
```

## License

MIT

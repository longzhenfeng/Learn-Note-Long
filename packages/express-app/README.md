# Express 学习项目

## 快速开始

```bash
# 从根目录运行
pnpm express:dev

# 或进入项目目录
cd packages/express-app
pnpm dev
```

## 本地开发环境

本项目内置了 macOS 兼容的 MongoDB (v6.0.12)，无需手动安装。

### 启动数据库

在**单独的终端**中运行以下命令启动数据库：

```bash
# 在项目根目录运行
pnpm run db:start

# 或者进入 express-app 目录运行
cd packages/express-app
./start-db.sh
```

数据库将启动在 `mongodb://127.0.0.1:27017`，数据存储在 `packages/express-app/mongodb-data` 目录。

### 查看数据

无需安装额外工具，直接运行脚本查看数据库内容：

```bash
pnpm db:view
```

### 启动服务器

确保数据库运行后，启动 API 服务器：

```bash
pnpm express:dev
```

## 环境配置

配置 `.env` 文件 (已默认配置好本地连接)：

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/express-app
PORT=3000
```


## API 端点

### 基础接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 欢迎信息 |
| GET | `/api/health` | 健康检查 |

### 用户模块

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取所有用户 |
| GET | `/api/users/:id` | 通过ID查询用户 |
| POST | `/api/users` | 新增用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |

### 用户字段

```json
{
  "name": "张三",
  "age": 25,
  "address": "北京市朝阳区",
  "hobbies": ["读书", "游泳"],
  "role": "user"  // admin | user | guest
}
```

## 学习资源

- [Express 官方文档](https://expressjs.com/)
- [Mongoose 官方文档](https://mongoosejs.com/)

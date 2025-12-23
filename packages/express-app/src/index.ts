import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello Express with TypeScript!' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 用户模块路由
app.use('/api/users', userRoutes);

// 连接数据库并启动服务器
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();

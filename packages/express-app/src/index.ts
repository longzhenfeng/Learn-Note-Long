import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
// import { userMiddle } from './middle/userMiddle';
import { logger } from './middle/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger());
// app.use(userMiddle());

// 设置视图引擎
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));


// 路由
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello Express with TypeScript!' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 用户模块路由
app.use('/api/users', userRoutes);
// 模版引擎
app.get('/views', (req, res) => {
  res.render('text')
});


// 错误处理 note: 一定要放到所有路由的后边, 否则无法捕获路由错误
app.use('*', (_req: Request, res: Response) => {
  res.status(404).render('404', {url: _req.originalUrl});
})
// 连接数据库并启动服务器
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();

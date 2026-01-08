import { Request, Response, NextFunction } from 'express';

export const userMiddle = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log('这是用户中间件');
    next(); // 调用下一个中间件或路由处理程序
  };
};
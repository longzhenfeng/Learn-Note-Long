import { Router, Request, Response, type IRouter } from 'express';
import User from '../models/User';

const router: IRouter = Router();

// 获取所有用户
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error instanceof Error ? error.message : error,
    });
  }
});

// 通过 ID 获取单个用户
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户失败',
      error: error instanceof Error ? error.message : error,
    });
  }
});

// 新增用户
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, age, address, hobbies, role } = req.body;
    const user = new User({ name, age, address, hobbies, role });
    await user.save();
    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '创建用户失败',
      error: error instanceof Error ? error.message : error,
    });
  }
});

// 更新用户
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, age, address, hobbies, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, age, address, hobbies, role },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }
    res.json({
      success: true,
      message: '用户更新成功',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新用户失败',
      error: error instanceof Error ? error.message : error,
    });
  }
});

// 删除用户
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }
    res.json({
      success: true,
      message: '用户删除成功',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: error instanceof Error ? error.message : error,
    });
  }
});

export default router;

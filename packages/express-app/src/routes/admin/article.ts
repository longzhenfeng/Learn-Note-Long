import { Router } from 'express'
import db from '../../../models/index'

const router = Router()

// 获取文章列表
router.get('/', async (_req, res) => {
  try {
    const list = await db.Article.findAll()

    res.json({
      success: true,
      data: list
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

export default router

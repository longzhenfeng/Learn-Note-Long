import { Router } from 'express'
import { Article } from '../../models/index.js'

const router = Router()

// 获取文章列表
router.get('/', async (_req, res) => {
  try {
    const list = await Article.findAll()

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

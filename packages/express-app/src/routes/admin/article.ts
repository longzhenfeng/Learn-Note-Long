import { Router } from 'express'
import db from '../../../models/index'

const router = Router()

// 获取文章列表
router.get('/', async (_req, res) => {
  try {
    const order = [['id', 'DESC']]
    const list = await db.Article.findAll({ order })

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
// 通过 ID 获取单个文章
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const article = await db.Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      })
    }

    res.json({
      success: true,
      data: article
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})
// 新增文章
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body
    const newArticle = await db.Article.create({ title, content, author })

    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: newArticle
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
})
//删除文章
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deletedCount = await db.Article.destroy({ where: { id } })
    
    if (!!!deletedCount) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      })
    }
    res.json({
      success: true,
      message: '文章删除成功',
      data: null
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})
//更新文章
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body

    const [updatedCount, updatedRows] = await db.Article.update(
      { title, content },
      { where: { id }, returning: true }
    )

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      })
    }

    res.json({
      success: true,
      message: '文章更新成功',
      data: updatedRows[0]
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }})

  //模糊查询
  router.get('/', async (req, res) => {
    try {
      const { title } = req.query
      const whereClause = title ? { title: { [db.Sequelize.Op.like]: `%${title}%` } } : {}
      const order = [['id', 'DESC']]
      const list = await db.Article.findAll({ where: whereClause, order })

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

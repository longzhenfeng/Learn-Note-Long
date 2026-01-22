import { Router } from "express"
import db from "../../../models/index"
import { Op } from "sequelize"
import {
  NotFoundError,
  successResponse as success,
  failureResponse as failure,
} from "../../utils/response"

const router = Router()

// 获取文章列表
router.get("/", async (_req, res) => {
  try {
    const { title, currentPage = 1, pageSize = 10 } = _req.query
    const limit = Number(pageSize)
    const offset = (Number(currentPage) - 1) * Number(pageSize)
    const condition: any = {
      order: [["id", "DESC"]],
      offset,
      limit,
    }

    // 模糊查询标题 SELECT * FROM `Articles` WHERE title LIKE '%title%'
    if (title) {
      condition.where = {
        title: {
          [Op.like]: `%${title}%`,
        },
      }
    }
    const { count, rows } = await db.Article.findAndCountAll(condition)

    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          currentPage: Number(currentPage),
          pageSize: Number(pageSize),
          total: count,
        },
      },
    })
  } catch (err: any) {
    failure(res, err)
  }
})
// 通过 ID 获取单个文章
router.get("/:id", async (req, res) => {
  try {
    // const { id } = req.params
    // const article = await db.Article.findByPk(id)
    // if (!article) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "文章不存在",
    //   })
    // }
    const article = await getArticle(req)
    success(res, "请求成功", article)
  } catch (err: any) {
    failure(res, err)
  }
})
// 新增文章
router.post("/", async (req, res) => {
  try {
    // tip: 从body里边获取的数据, 一定要谨慎, 不要相信用户提交的数据(只保留需要的字段)
    const { title, content, author } = req.body
    // if(!title) throw new Error('文章标题不能为空')
    const newArticle = await db.Article.create({ title, content, author })

    success(res, "文章创建成功", newArticle, 201)
  } catch (err: any) {
    failure(res, err)
  }
})
//删除文章
router.delete("/:id", async (req, res) => {
  try {
    // const { id } = req.params
    // const deletedCount = await db.Article.destroy({ where: { id } })

    // if (!!!deletedCount) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "文章不存在",
    //   })
    // }
    const article = await getArticle(req)
    await article.destroy()
    success(res, "文章删除成功")
  } catch (err: any) {
    failure(res, err)
  }
})
//更新文章
router.put("/:id", async (req, res) => {
  try {
    // const { id } = req.params
    // const { title, content } = req.body

    // const [updatedCount, updatedRows] = await db.Article.update(
    //   { title, content },
    //   { where: { id }, returning: true },
    // )

    // if (updatedCount === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "文章不存在",
    //   })
    // }
    const article = await getArticle(req)
    await article.update(req.body)
    success(res, "文章更新成功", article)
  } catch (err: any) {
    failure(res, err)
  }
})

//模糊查询
router.get("/", async (req, res) => {
  try {
    const { title } = req.query
    const whereClause = title
      ? { title: { [db.Sequelize.Op.like]: `%${title}%` } }
      : {}
    const order = [["id", "DESC"]]
    const list = await db.Article.findAll({ where: whereClause, order })

    res.json({
      success: true,
      data: list,
    })
  } catch (err: any) {
    failure(res, err)
  }
})

export default router

/**
 * 公共方法: 查询当前文章
 */
const getArticle = async (req: any) => {
  const { id } = req.params
  const article = await db.Article.findByPk(id)
  if (!article) {
    throw new NotFoundError("文章不存在")
  }
  return article
}

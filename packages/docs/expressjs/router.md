#
  路由
##
 查询单条文章

admin/article/1
```js
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const article = Article.findByPk(id)
  res.json({
    status: true,
    message: '查询文章成功',
    data: article
  })
})
```

 
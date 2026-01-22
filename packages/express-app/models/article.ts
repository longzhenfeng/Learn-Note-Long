export default (sequelize: any, DataTypes: any) => {
  const Article = sequelize.define('Article', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '标题不能为空'
        },
        notNull: {
          msg: '标题不能为空'
        },
        len: {
          args: [2, 255],
          msg: '标题长度必须在2到255个字符之间'
        }
      }
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'Articles'
  })

  return Article
}

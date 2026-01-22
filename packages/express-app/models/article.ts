export default (sequelize: any, DataTypes: any) => {
  const Article = sequelize.define('Article', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'Articles'
  })

  return Article
}

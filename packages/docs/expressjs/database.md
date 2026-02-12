# Express 数据库集成

## MongoDB 集成

### 1. Mongoose 基础配置

```javascript
const mongoose = require('mongoose')

// 连接数据库
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
```

### 2. 定义 Schema

```javascript
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // 默认不返回密码
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)
```

### 3. Schema 方法

```javascript
// 实例方法
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// 静态方法
userSchema.statics.getAverageCost = async function(courseId) {
  const obj = await this.aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageCost: { $avg: '$tuition' }
      }
    }
  ])

  try {
    await this.model('Course').findByIdAndUpdate(courseId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    })
  } catch (err) {
    console.error(err)
  }
}

// 虚拟字段
userSchema.virtual('enrolledCourses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'user',
  justOne: false
})

// 中间件 - 保存前
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// 中间件 - 删除后
userSchema.post('remove', async function() {
  await this.model('Course').deleteMany({ user: this._id })
})
```

### 4. CRUD 操作

```javascript
const User = require('../models/User')

// 创建用户
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 获取所有用户
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    next(error)
  }
}

// 获取单个用户
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(new AppError(`User not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 更新用户
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!user) {
      return next(new AppError(`User not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 删除用户
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return next(new AppError(`User not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
}
```

### 5. 高级查询

```javascript
// 分页、排序、选择字段
exports.getUsers = async (req, res, next) => {
  // 查询参数
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const total = await User.countDocuments()

  const query = User.find()
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt')
    .select('name email role')

  const users = await query

  // 分页结果
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  })
}

// 高级查询
exports.getAdvancedUsers = async (req, res, next) => {
  let query

  // 复制查询对象
  const reqQuery = { ...req.query }

  // 要排除的字段
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach(param => delete reqQuery[param])

  // 创建查询字符串
  let queryStr = JSON.stringify(reqQuery)

  // 操作符替换
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

  // 查找资源
  query = User.find(JSON.parse(queryStr))

  // 选择字段
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  // 排序
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const total = await User.countDocuments(JSON.parse(queryStr))

  query = query.skip(startIndex).limit(limit)

  const users = await query

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: { page, limit, total },
    data: users
  })
}

// 聚合查询
exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}
```

## MySQL 集成

### 6. Sequelize 基础配置

```javascript
const { Sequelize } = require('sequelize')

// 创建连接
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

// 测试连接
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('MySQL connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

module.exports = { sequelize, testConnection }
```

### 7. 定义模型

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: 'default-avatar.png'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }
  }
})

// 实例方法
User.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = User
```

### 8. 关联关系

```javascript
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const User = sequelize.define('User', {
  // 用户字段
})

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

// 一对多关系：一个用户有多篇文章
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts'
})
Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
})

// 一对多关系：一篇文章有多条评论
Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments'
})
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
})

// 多对多关系：文章和标签
const Tag = sequelize.define('Tag', {
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
})

Post.belongsToMany(Tag, {
  through: 'PostTags',
  foreignKey: 'post_id',
  as: 'tags'
})

Tag.belongsToMany(Post, {
  through: 'PostTags',
  foreignKey: 'tag_id',
  as: 'posts'
})

module.exports = { User, Post, Comment, Tag }
```

### 9. Sequelize CRUD 操作

```javascript
const { User, Post, Comment } = require('../models')

// 创建
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 查询所有
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    })
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    next(error)
  }
}

// 查询单个
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Post,
          as: 'posts',
          include: [
            {
              model: Comment,
              as: 'comments'
            }
          ]
        }
      ]
    })

    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 更新
exports.updateUser = async (req, res, next) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true
    })

    if (updated === 0) {
      return next(new AppError('User not found', 404))
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    })

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 删除
exports.deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    })

    if (deleted === 0) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    next(error)
  }
}

// 高级查询
exports.getAdvancedUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at', order = 'DESC', ...filters } = req.query

    const offset = (page - 1) * limit

    const { count, rows } = await User.findAndCountAll({
      where: filters,
      attributes: { exclude: ['password'] },
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    })
  } catch (error) {
    next(error)
  }
}
```

## Redis 集成

### 10. Redis 基础配置

```javascript
const redis = require('redis')

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
})

redisClient.on('connect', () => {
  console.log('Redis connected')
})

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

module.exports = redisClient
```

### 11. Redis 缓存

```javascript
const redisClient = require('../config/redis')

// 缓存中间件
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`

    try {
      const data = await redisClient.get(key)

      if (data) {
        return res.json(JSON.parse(data))
      }

      res.sendResponse = res.json
      res.json = (body) => {
        redisClient.setex(key, duration, JSON.stringify(body))
        res.sendResponse(body)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// 使用
app.get('/api/users', cache(3600), getUsers)
```

### 12. Session 存储

```javascript
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redisClient = require('../config/redis')

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}))
```

## 事务处理

### 13. Mongoose 事务

```javascript
const session = await mongoose.startSession()

try {
  session.startTransaction()

  const user = await User.create([{ name: 'John' }], { session })
  const post = await Post.create([{ title: 'Hello', user: user[0]._id }], { session })

  await session.commitTransaction()
  res.json({ user, post })
} catch (error) {
  await session.abortTransaction()
  next(error)
} finally {
  session.endSession()
}
```

### 14. Sequelize 事务

```javascript
const t = await sequelize.transaction()

try {
  const user = await User.create({ name: 'John' }, { transaction: t })
  const post = await Post.create({ title: 'Hello', userId: user.id }, { transaction: t })

  await t.commit()
  res.json({ user, post })
} catch (error) {
  await t.rollback()
  next(error)
}
```

## 数据库迁移

### 15. Mongoose 迁移

```javascript
// migrations/001-add-avatar-field.js
const mongoose = require('mongoose')

module.exports = {
  async up() {
    await mongoose.connection.collection('users').updateMany(
      { avatar: { $exists: false } },
      { $set: { avatar: 'default-avatar.png' } }
    )
  },

  async down() {
    await mongoose.connection.collection('users').updateMany(
      {},
      { $unset: { avatar: '' } }
    )
  }
}
```

### 16. Sequelize 迁移

```javascript
// migrations/20230101000000-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users')
  }
}
```

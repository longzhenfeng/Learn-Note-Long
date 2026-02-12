# Express 错误处理

## 错误处理基础

### 1. 基本错误处理

```javascript
const express = require('express')
const app = express()

// 错误处理中间件（必须有四个参数）
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// 触发错误
app.get('/', (req, res) => {
  throw new Error('Something went wrong!')
})
```

### 2. 同步错误处理

```javascript
// Express 会自动捕获同步错误
app.get('/sync-error', (req, res) => {
  const user = null
  if (!user) {
    throw new Error('User not found')
  }
  res.json(user)
})
```

### 3. 异步错误处理

```javascript
// 方法一：使用 try-catch
app.get('/async-error', async (req, res, next) => {
  try {
    const data = await someAsyncFunction()
    res.json(data)
  } catch (error) {
    next(error) // 传递给错误处理中间件
  }
})

// 方法二：使用包装函数
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

app.get('/async-error-2', asyncHandler(async (req, res) => {
  const data = await someAsyncFunction()
  res.json(data)
}))
```

## 自定义错误类

### 4. 创建自定义错误类

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
```

### 5. 使用自定义错误

```javascript
const AppError = require('./utils/AppError')

// 在路由中使用
app.get('/user/:id', async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  res.json(user)
})
```

## 错误处理中间件

### 6. 全局错误处理中间件

```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }

  // 生产环境
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }

  // 编程错误
  console.error('ERROR 💥:', err)
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  })
}

module.exports = errorHandler
```

### 7. 处理特定错误类型

```javascript
// 处理 MongoDB CastError
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

// 处理 MongoDB 重复字段错误
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

// 处理 MongoDB 验证错误
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

// 处理 JWT 错误
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401)

// 处理 JWT 过期错误
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401)
```

### 8. 完整的错误处理中间件

```javascript
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    // 处理不同类型的错误
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()

    sendErrorForProd(error, res)
  }
}

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorForProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    console.error('ERROR 💥:', err)
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
}
```

## 404 处理

### 9. 处理未找到的路由

```javascript
// 处理所有未匹配的路由
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})
```

### 10. 404 错误页面

```javascript
// 返回 HTML 错误页面
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  })
})
```

## 验证错误

### 11. 使用 express-validator

```javascript
const { body, validationResult } = require('express-validator')

// 验证规则
const validateUser = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
]

// 路由处理
app.post('/register', validateUser, (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400))
  }

  // 创建用户逻辑
  res.json({ message: 'User created' })
})
```

### 12. 使用 Joi 验证

```javascript
const Joi = require('joi')

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/\d/).required(),
  name: Joi.string().min(3).max(30)
})

app.post('/register', (req, res, next) => {
  const { error } = userSchema.validate(req.body)

  if (error) {
    return next(new AppError(error.details[0].message, 400))
  }

  // 创建用户逻辑
  res.json({ message: 'User created' })
})
```

## 数据库错误

### 13. MongoDB 错误处理

```javascript
// 处理连接错误
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

// 处理连接断开
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

// 处理查询错误
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return next(new AppError('User not found', 404))
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})
```

### 14. Sequelize 错误处理

```javascript
// 处理验证错误
app.post('/users', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message)
      return next(new AppError(errors.join(', '), 400))
    }
    next(error)
  }
})

// 处理唯一性约束错误
app.post('/users', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('Email already exists', 400))
    }
    next(error)
  }
})
```

## API 错误响应格式

### 15. 统一错误响应格式

```javascript
// utils/response.js
const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  })
}

const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

module.exports = { sendError, sendSuccess }
```

### 16. 使用统一响应

```javascript
const { sendError, sendSuccess } = require('./utils/response')

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return sendError(res, 404, 'User not found')
    }
    sendSuccess(res, 200, user, 'User retrieved successfully')
  } catch (error) {
    next(error)
  }
})
```

## 日志记录

### 17. 错误日志

```javascript
const fs = require('fs')
const path = require('path')

// 写入错误日志
const logError = (err) => {
  const logDir = path.join(__dirname, 'logs')
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
  }

  const logFile = path.join(logDir, 'error.log')
  const logMessage = `${new Date().toISOString()} - ${err.stack}\n`

  fs.appendFileSync(logFile, logMessage)
}

// 在错误处理中间件中使用
app.use((err, req, res, next) => {
  logError(err)
  // 其他错误处理逻辑
})
```

### 18. 使用 Winston 日志

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// 使用
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack })
  // 其他错误处理逻辑
})
```

## 最佳实践

### 19. 错误处理最佳实践

```javascript
// 1. 使用自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// 2. 区分操作错误和编程错误
// 操作错误：用户输入错误、网络错误等
// 编程错误：代码bug、未处理的Promise等

// 3. 使用异步处理包装器
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 4. 提供有用的错误信息
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // 不暴露敏感信息
    return res.status(500).json({
      message: 'Something went wrong'
    })
  }

  // 开发环境提供详细信息
  res.status(err.statusCode || 500).json({
    message: err.message,
    stack: err.stack
  })
})
```

### 20. 错误监控

```javascript
// 使用 Sentry 监控错误
const Sentry = require('@sentry/node')

Sentry.init({
  dsn: 'your-dsn-here',
  environment: process.env.NODE_ENV
})

app.use(Sentry.Handlers.requestHandler())

// 错误处理
app.use(Sentry.Handlers.errorHandler())

// 或手动发送错误
app.use((err, req, res, next) => {
  Sentry.captureException(err)
  res.status(500).json({ message: 'Something went wrong' })
})
```

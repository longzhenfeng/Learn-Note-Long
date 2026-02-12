# Express 中间件

## 什么是中间件

中间件是一个函数，它可以访问请求对象（`req`）、响应对象（`res`）和应用程序的请求-响应循环中的下一个中间件函数（`next`）。

## 基础中间件

### 1. 应用级中间件

```javascript
const express = require('express')
const app = express()

// 没有挂载路径的中间件，应用的每个请求都会执行
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

// 挂载到 /user 路径的中间件
app.use('/user', (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})
```

### 2. 路由级中间件

```javascript
const express = require('express')
const router = express.Router()

// 路由级中间件
router.use((req, res, next) => {
  console.log('Router middleware')
  next()
})

router.get('/', (req, res) => {
  res.send('Home page')
})

app.use('/api', router)
```

### 3. 错误处理中间件

```javascript
// 错误处理中间件有四个参数
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

## 常用中间件

### 4. body-parser 解析请求体

```javascript
// 内置的 body-parser 中间件
app.use(express.json()) // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })) // 解析 URL 编码的请求体

// 使用示例
app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  res.json({ name, email })
})
```

### 5. 静态文件服务

```javascript
// 提供静态文件
app.use(express.static('public'))
app.use(express.static('files'))

// 指定虚拟路径前缀
app.use('/static', express.static('public'))

// 使用示例
// 访问 http://localhost:3000/static/images/logo.png
// 实际访问 public/images/logo.png
```

### 6. Cookie 解析

```javascript
const cookieParser = require('cookie-parser')

app.use(cookieParser())

app.get('/', (req, res) => {
  console.log('Cookies:', req.cookies)
  res.send('Cookies received')
})

// 设置 Cookie
app.get('/set-cookie', (req, res) => {
  res.cookie('name', 'value', {
    maxAge: 900000,
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  })
  res.send('Cookie set')
})
```

### 7. 日志中间件

```javascript
const morgan = require('morgan')

// 开发环境日志
app.use(morgan('dev'))

// 自定义日志格式
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// 写入文件
const fs = require('fs')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
```

### 8. CORS 跨域处理

```javascript
const cors = require('cors')

// 简单启用
app.use(cors())

// 配置选项
app.use(cors({
  origin: ['http://localhost:3000', 'https://example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// 为特定路由配置 CORS
app.get('/api/data', cors(), (req, res) => {
  res.json({ data: 'This has CORS enabled' })
})
```

## 自定义中间件

### 9. 身份验证中间件

```javascript
// 简单的身份验证
function authenticate(req, res, next) {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  // 验证 token
  try {
    const decoded = jwt.verify(token, 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// 使用中间件
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected data', user: req.user })
})
```

### 10. 请求日志中间件

```javascript
function requestLogger(req, res, next) {
  const start = Date.now()

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`)
  })

  next()
}

app.use(requestLogger)
```

### 11. 请求验证中间件

```javascript
const { body, validationResult } = require('express-validator')

// 验证中间件
function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// 使用示例
app.post('/api/users',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validateRequest,
  (req, res) => {
    res.json({ message: 'User created' })
  }
)
```

### 12. 限流中间件

```javascript
const rateLimit = require('express-rate-limit')

// 基础限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个 IP 100 次请求
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)

// 为不同路由设置不同限流
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
})

app.post('/api/login', strictLimiter, (req, res) => {
  res.json({ message: 'Login endpoint' })
})
```

### 13. 压缩中间件

```javascript
const compression = require('compression')

app.use(compression())

// 配置选项
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  threshold: 1024 // 只压缩大于 1KB 的响应
}))
```

### 14. Helmet 安全中间件

```javascript
const helmet = require('helmet')

app.use(helmet())

// 自定义配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}))
```

## 中间件执行顺序

### 15. 中间件链

```javascript
// 中间件按定义顺序执行
app.use(middleware1)
app.use(middleware2)
app.use(middleware3)

app.get('/', (req, res) => {
  res.send('Home')
})

// 执行顺序：middleware1 -> middleware2 -> middleware3 -> 路由处理函数
```

### 16. 条件中间件

```javascript
// 根据条件使用中间件
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return apiMiddleware(req, res, next)
  }
  next()
})

// 或使用 app.use 的条件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
```

### 17. 错误传递

```javascript
// 同步错误会自动传递到错误处理中间件
app.use((req, res, next) => {
  throw new Error('Something went wrong')
})

// 异步错误需要手动传递
app.use(async (req, res, next) => {
  try {
    await someAsyncOperation()
    next()
  } catch (error) {
    next(error)
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})
```

## 第三方中间件推荐

### 18. 常用第三方中间件

```javascript
// 文件上传
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// 会话管理
const session = require('express-session')

// 请求 ID
const requestId = require('express-request-id')

// 响应时间
const responseTime = require('response-time')

// 健康检查
const health = require('express-ping')

// 方法覆盖
const methodOverride = require('method-override')

// 幂等性检查
const idempotency = require('express-idempotency')
```

## 最佳实践

### 19. 中间件组织

```javascript
// middlewares/auth.js
function authenticate(req, res, next) {
  // 验证逻辑
  next()
}

// middlewares/validator.js
function validate(schema) {
  return (req, res, next) => {
    // 验证逻辑
    next()
  }
}

// 使用
const { authenticate } = require('./middlewares/auth')
const { validate } = require('./middlewares/validator')

app.get('/api/data', authenticate, validate(userSchema), (req, res) => {
  res.json({ data: '...' })
})
```

### 20. 中间件性能优化

```javascript
// 只在需要的路由上使用中间件
app.get('/api/data', heavyMiddleware, (req, res) => {
  // ...
})

// 使用缓存
const cache = new Map()

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl
  if (cache.has(key)) {
    return res.json(cache.get(key))
  }
  res.sendResponse = res.json
  res.json = (data) => {
    cache.set(key, data)
    res.sendResponse(data)
  }
  next()
}
```

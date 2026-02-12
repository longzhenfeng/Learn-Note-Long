# Express 身份验证

## 基础认证

### 1. HTTP Basic 认证

```javascript
const basicAuth = require('express-basic-auth')

// 简单配置
app.use(basicAuth({
  users: { 'admin': 'supersecret' }
}))

// 使用自定义认证逻辑
app.use(basicAuth({
  authorizer: (username, password) => {
    const userMatches = basicAuth.safeCompare(username, 'admin')
    const passwordMatches = basicAuth.safeCompare(password, 'supersecret')
    return userMatches & passwordMatches
  },
  challenge: true,
  realm: 'My App'
}))
```

### 2. API Key 认证

```javascript
// API Key 中间件
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key is required' })
  }

  // 验证 API Key
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API Key' })
  }

  req.apiKey = apiKey
  next()
}

// 使用
app.get('/api/data', apiKeyAuth, (req, res) => {
  res.json({ data: 'Protected data' })
})
```

## JWT 认证

### 3. JWT 基础使用

```javascript
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// 生成 Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// 验证 Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// 注册路由
app.post('/register', async (req, res) => {
  const { email, password } = req.body

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10)

  // 创建用户
  const user = await User.create({
    email,
    password: hashedPassword
  })

  // 生成 Token
  const token = generateToken(user)

  res.status(201).json({
    status: 'success',
    token,
    data: { user: { id: user.id, email: user.email } }
  })
})

// 登录路由
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body

  // 查找用户
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  // 生成 Token
  const token = generateToken(user)

  res.json({
    status: 'success',
    token
  })
})
```

### 4. JWT 认证中间件

```javascript
// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 获取 Token
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401))
    }

    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 检查用户是否存在
    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401))
    }

    // 检查用户是否更改了密码
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again.', 401))
    }

    req.user = user
    next()
  } catch (error) {
    next(new AppError('Invalid or expired token', 401))
  }
}

// 使用
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected data', user: req.user })
})
```

### 5. JWT 刷新 Token

```javascript
// 生成刷新 Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  )
}

// 刷新 Token 路由
app.post('/refresh-token', async (req, res, next) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400))
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new AppError('Invalid refresh token', 401))
    }

    const newToken = generateToken(user)
    const newRefreshToken = generateRefreshToken(user)

    res.json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    next(new AppError('Invalid refresh token', 401))
  }
})
```

## Session 认证

### 6. Express Session 基础

```javascript
const session = require('express-session')

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}))

// 登录
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  req.session.userId = user.id
  res.json({ message: 'Logged in successfully' })
})

// 登出
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out successfully' })
  })
})

// 检查登录状态
app.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' })
  }

  User.findById(req.session.userId).then(user => {
    res.json(user)
  })
})
```

### 7. Passport.js 集成

```javascript
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

// 本地策略
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: 'Incorrect email or password' })
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}))

// JWT 策略
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id)
    if (!user) {
      return done(null, false)
    }
    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

// 序列化用户
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// 反序列化用户
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// 使用 Passport
app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = generateToken(req.user)
  res.json({ token, user: req.user })
})

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user })
})
```

## OAuth 认证

### 8. Google OAuth

```javascript
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id })

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      })
    }

    done(null, user)
  } catch (error) {
    done(error, null)
  }
}))

// Google 认证路由
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user)
    res.redirect(`http://localhost:3000/auth/callback?token=${token}`)
  }
)
```

### 9. GitHub OAuth

```javascript
const GitHubStrategy = require('passport-github2').Strategy

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id })

    if (!user) {
      user = await User.create({
        githubId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value
      })
    }

    done(null, user)
  } catch (error) {
    done(error, null)
  }
}))

// GitHub 认证路由
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }))

app.get('/auth/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = generateToken(req.user)
    res.redirect(`http://localhost:3000/auth/callback?token=${token}`)
  }
)
```

## 权限控制

### 10. 角色授权

```javascript
// 授权中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next()
  }
}

// 使用
app.delete('/api/users/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    res.status(204).json()
  }
)
```

### 11. 资源所有权检查

```javascript
// 检查资源所有权
const checkOwnership = (Model) => {
  return async (req, res, next) => {
    const resource = await Model.findById(req.params.id)

    if (!resource) {
      return next(new AppError('Resource not found', 404))
    }

    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to access this resource', 403))
    }

    req.resource = resource
    next()
  }
}

// 使用
app.put('/api/posts/:id',
  authenticate,
  checkOwnership(Post),
  async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(post)
  }
)
```

## 密码管理

### 12. 密码加密

```javascript
const bcrypt = require('bcryptjs')

// 加密密码
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// 验证密码
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

// 使用
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  const hashedPassword = await hashPassword(password)

  const user = await User.create({ email, password: hashedPassword })
  res.json({ user })
})
```

### 13. 密码重置

```javascript
const crypto = require('crypto')

// 生成重置 Token
const createPasswordResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString('hex')

  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 分钟

  return resetToken
}

// 忘记密码
app.post('/forgot-password', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new AppError('There is no user with that email address', 404))
  }

  const resetToken = createPasswordResetToken(user)
  await user.save({ validateBeforeSave: false })

  // 发送邮件
  const resetURL = `${req.protocol}://${req.get('host')}/api/reset-password/${resetToken}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}`
    })

    res.json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error sending the email. Try again later!', 500))
  }
})

// 重置密码
app.patch('/reset-password/:token', async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.password = await hashPassword(req.body.password)
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  const token = generateToken(user)

  res.json({
    status: 'success',
    token
  })
})
```

## 安全最佳实践

### 14. 安全配置

```javascript
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// 安全头
app.use(helmet())

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
})

app.use('/api/', limiter)

// 登录限流
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, try again in an hour'
})

app.post('/login', loginLimiter, async (req, res) => {
  // 登录逻辑
})
```

### 15. 输入验证

```javascript
const { body, validationResult } = require('express-validator')

// 注册验证
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required')
]

app.post('/register', registerValidation, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400))
  }

  // 注册逻辑
})
```

# Node.js HTTP 模块

## HTTP 服务器

### 1. 创建简单服务器

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello, World!')
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### 2. 路由处理

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  const { method, url } = req

  // 首页
  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>Home Page</h1>')
  }
  // 关于页面
  else if (url === '/about' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>About Page</h1>')
  }
  // 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>404 Not Found</h1>')
  }
})

server.listen(3000)
```

### 3. 处理 POST 请求

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, received: data }))
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      }
    })
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.listen(3000)
```

## HTTP 客户端

### 4. 发送 GET 请求

```javascript
const http = require('http')

http.get('http://example.com/api/data', (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('Response:', data)
  })
}).on('error', (error) => {
  console.error('Error:', error)
})
```

### 5. 发送 POST 请求

```javascript
const http = require('http')

const data = JSON.stringify({ name: 'John', age: 30 })

const options = {
  hostname: 'example.com',
  port: 80,
  path: '/api/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, (res) => {
  let body = ''

  res.on('data', (chunk) => {
    body += chunk
  })

  res.on('end', () => {
    console.log('Response:', body)
  })
})

req.on('error', (error) => {
  console.error('Error:', error)
})

req.write(data)
req.end()
```

### 6. HTTPS 请求

```javascript
const https = require('https')

https.get('https://api.example.com/data', (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('Response:', data)
  })
})
```

## 静态文件服务

### 7. 提供静态文件

```javascript
const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url)

  const extname = path.extname(filePath)
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  }[extname] || 'application/octet-stream'

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.end(content, 'utf-8')
        })
      } else {
        res.writeHead(500)
        res.end('Server Error')
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(3000)
```

## REST API

### 8. RESTful API 服务器

```javascript
const http = require('http')
const url = require('url')

// 模拟数据库
let users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const { pathname, query } = parsedUrl
  const method = req.method

  // 设置响应头
  res.setHeader('Content-Type', 'application/json')

  // GET /users - 获取所有用户
  if (pathname === '/users' && method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify(users))
  }

  // GET /users/:id - 获取单个用户
  else if (pathname.match(/^\/users\/\d+$/) && method === 'GET') {
    const id = parseInt(pathname.split('/')[2])
    const user = users.find(u => u.id === id)

    if (user) {
      res.writeHead(200)
      res.end(JSON.stringify(user))
    } else {
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'User not found' }))
    }
  }

  // POST /users - 创建用户
  else if (pathname === '/users' && method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk.toString())
    req.on('end', () => {
      const { name, email } = JSON.parse(body)
      const newUser = { id: users.length + 1, name, email }
      users.push(newUser)
      res.writeHead(201)
      res.end(JSON.stringify(newUser))
    })
  }

  // PUT /users/:id - 更新用户
  else if (pathname.match(/^\/users\/\d+$/) && method === 'PUT') {
    const id = parseInt(pathname.split('/')[2])
    const userIndex = users.findIndex(u => u.id === id)

    if (userIndex !== -1) {
      let body = ''
      req.on('data', chunk => body += chunk.toString())
      req.on('end', () => {
        const { name, email } = JSON.parse(body)
        users[userIndex] = { ...users[userIndex], name, email }
        res.writeHead(200)
        res.end(JSON.stringify(users[userIndex]))
      })
    } else {
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'User not found' }))
    }
  }

  // DELETE /users/:id - 删除用户
  else if (pathname.match(/^\/users\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[2])
    const userIndex = users.findIndex(u => u.id === id)

    if (userIndex !== -1) {
      users.splice(userIndex, 1)
      res.writeHead(204)
      res.end()
    } else {
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'User not found' }))
    }
  }

  else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(3000, () => {
  console.log('API Server running on http://localhost:3000')
})
```

## 文件上传

### 9. 处理文件上传

```javascript
const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    const boundary = req.headers['content-type'].split('; ')[1].split('=')[1]
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString('binary')
    })

    req.on('end', () => {
      const parts = body.split(`--${boundary}`)
      parts.forEach(part => {
        if (part.includes('filename=')) {
          const filename = part.match(/filename="(.+)"/)[1]
          const fileData = part.split('\r\n\r\n')[1].replace('\r\n--', '')
          const filepath = path.join(__dirname, 'uploads', filename)

          fs.writeFileSync(filepath, fileData, 'binary')
        }
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true }))
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <button type="submit">Upload</button>
      </form>
    `)
  }
})

server.listen(3000)
```

## 流式处理

### 10. 流式响应

```javascript
const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'large-file.txt')
  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = (end - start) + 1
    const file = fs.createReadStream(filePath, { start, end })

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'text/plain'
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'text/plain'
    }

    res.writeHead(200, head)
    fs.createReadStream(filePath).pipe(res)
  }
})

server.listen(3000)
```

## 错误处理

### 11. 错误处理中间件

```javascript
const http = require('http')

function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.writeHead(500, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Internal Server Error' }))
}

function notFoundHandler(req, res) {
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
}

const server = http.createServer(async (req, res) => {
  try {
    // 路由逻辑
    if (req.url === '/error') {
      throw new Error('Something went wrong')
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Success' }))
  } catch (error) {
    errorHandler(error, req, res)
  }
})

server.on('error', (error) => {
  console.error('Server error:', error)
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

## WebSocket 支持

### 12. HTTP 升级到 WebSocket

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <html>
        <script>
          const ws = new WebSocket('ws://localhost:3000');
          ws.onmessage = (event) => console.log(event.data);
          ws.onopen = () => ws.send('Hello from client!');
        </script>
      </html>
    `)
  }
})

server.on('upgrade', (req, socket, head) => {
  console.log('WebSocket upgrade requested')

  // 简单的 WebSocket 处理
  socket.on('data', (data) => {
    console.log('Received:', data.toString())
    socket.write(data)
  })

  socket.on('end', () => {
    console.log('WebSocket closed')
  })
})

server.listen(3000)
```

## 实用工具

### 13. 请求解析工具

```javascript
const http = require('http')
const url = require('url')

function parseRequest(req) {
  return new Promise((resolve) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      const parsedUrl = url.parse(req.url, true)
      resolve({
        method: req.method,
        url: parsedUrl.pathname,
        query: parsedUrl.query,
        headers: req.headers,
        body: body ? JSON.parse(body) : {}
      })
    })
  })
}

const server = http.createServer(async (req, res) => {
  const request = await parseRequest(req)
  console.log('Request:', request)

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Request received' }))
})

server.listen(3000)
```

### 14. CORS 处理

```javascript
const http = require('http')

function cors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  next()
}

const server = http.createServer((req, res) => {
  cors(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'CORS enabled' }))
  })
})

server.listen(3000)
```

## 性能优化

### 15. 连接池

```javascript
const http = require('http')

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000
})

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { agent }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// 使用连接池
async function fetchMultiple(urls) {
  const results = await Promise.all(urls.map(makeRequest))
  return results
}
```

### 16. 压缩响应

```javascript
const http = require('http')
const zlib = require('zlib')

const server = http.createServer((req, res) => {
  const data = JSON.stringify({ message: 'This is a large response' })

  const acceptEncoding = req.headers['accept-encoding']

  if (acceptEncoding.includes('gzip')) {
    zlib.gzip(data, (err, compressed) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      })
      res.end(compressed)
    })
  } else if (acceptEncoding.includes('deflate')) {
    zlib.deflate(data, (err, compressed) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Encoding': 'deflate'
      })
      res.end(compressed)
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(data)
  }
})

server.listen(3000)
```

## 安全

### 17. 安全头

```javascript
const http = require('http')

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
}

const server = http.createServer((req, res) => {
  securityHeaders(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Secure response' }))
  })
})

server.listen(3000)
```

### 18. 限流

```javascript
const http = require('http')

const rateLimit = new Map()

function rateLimiter(req, res, next) {
  const ip = req.socket.remoteAddress
  const now = Date.now()
  const windowMs = 60 * 1000 // 1分钟
  const maxRequests = 10

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, resetTime: now + windowMs })
  }

  const client = rateLimit.get(ip)

  if (now > client.resetTime) {
    client.count = 0
    client.resetTime = now + windowMs
  }

  if (client.count >= maxRequests) {
    res.writeHead(429, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Too many requests' }))
    return
  }

  client.count++
  next()
}

const server = http.createServer((req, res) => {
  rateLimiter(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Request allowed' }))
  })
})

server.listen(3000)
```

## 最佳实践

### 19. 模块化路由

```javascript
// routes/users.js
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]

module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(users))
  } else if (req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk.toString())
    req.on('end', () => {
      const user = JSON.parse(body)
      users.push({ ...user, id: users.length + 1 })
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(user))
    })
  }
}

// server.js
const http = require('http')
const userRoutes = require('./routes/users')

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/users')) {
    userRoutes(req, res)
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(3000)
```

### 20. 日志记录

```javascript
const http = require('http')
const fs = require('fs')

function logger(req, res, next) {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const log = `${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms\n`

    fs.appendFile('access.log', log, (err) => {
      if (err) console.error('Error writing log:', err)
    })
  })

  next()
}

const server = http.createServer((req, res) => {
  logger(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Logged' }))
  })
})

server.listen(3000)
```

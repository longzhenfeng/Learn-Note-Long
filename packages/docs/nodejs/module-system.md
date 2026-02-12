# Node.js 模块系统

## CommonJS 模块

### 1. 导出模块

```javascript
// math.js

// 导出单个值
module.exports = function add(a, b) {
  return a + b
}

// 或导出对象
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
}

// 或逐个导出
exports.add = (a, b) => a + b
exports.subtract = (a, b) => a - b
```

### 2. 导入模块

```javascript
// main.js

// 导入整个模块
const math = require('./math')
console.log(math.add(1, 2)) // 3

// 导入特定方法
const { add, subtract } = require('./math')
console.log(add(1, 2)) // 3

// 导入内置模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const _ = require('lodash')
```

### 3. 模块缓存

```javascript
// counter.js
let count = 0

module.exports = {
  increment: () => ++count,
  decrement: () => --count,
  getCount: () => count
}

// main.js
const counter1 = require('./counter')
const counter2 = require('./counter') // 返回同一个实例

console.log(counter1 === counter2) // true

counter1.increment()
console.log(counter2.getCount()) // 1
```

## ES6 模块

### 4. ES6 模块导出

```javascript
// math.mjs

// 命名导出
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b

// 或批量导出
const multiply = (a, b) => a * b
const divide = (a, b) => a / b
export { multiply, divide }

// 默认导出
export default {
  add,
  subtract,
  multiply,
  divide
}

// 或默认导出函数
export default function(a, b) {
  return a + b
}
```

### 5. ES6 模块导入

```javascript
// main.mjs

// 导入命名导出
import { add, subtract } from './math.mjs'
console.log(add(1, 2)) // 3

// 导入默认导出
import math from './math.mjs'
console.log(math.add(1, 2)) // 3

// 导入所有
import * as math from './math.mjs'
console.log(math.add(1, 2)) // 3

// 混合导入
import math, { add } from './math.mjs'
```

### 6. package.json 配置

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js"
}
```

设置为 `"type": "module"` 后，所有 `.js` 文件都将被视为 ES6 模块。

### 7. CommonJS 和 ES6 模块互操作

```javascript
// ES6 模块中导入 CommonJS
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fs = require('fs')

// CommonJS 中导入 ES6 模块（需要动态导入）
(async () => {
  const { add } = await import('./math.mjs')
  console.log(add(1, 2))
})()
```

## 内置模块

### 8. 文件系统模块

```javascript
const fs = require('fs')
const fsPromises = fs.promises

// 同步操作
const data = fs.readFileSync('file.txt', 'utf8')
fs.writeFileSync('output.txt', 'Hello')

// 异步操作（回调）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})

// 异步操作（Promise）
async function readFile() {
  try {
    const data = await fsPromises.readFile('file.txt', 'utf8')
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
```

### 9. 路径模块

```javascript
const path = require('path')

// 路径拼接
const fullPath = path.join(__dirname, 'files', 'data.txt')

// 路径解析
const parsed = path.parse('/home/user/file.txt')
console.log(parsed)
// {
//   root: '/',
//   dir: '/home/user',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 获取目录名
console.log(path.dirname('/home/user/file.txt')) // /home/user

// 获取文件名
console.log(path.basename('/home/user/file.txt')) // file.txt
console.log(path.basename('/home/user/file.txt', '.txt')) // file

// 获取扩展名
console.log(path.extname('/home/user/file.txt')) // .txt

// 绝对路径
console.log(path.resolve('file.txt')) // /current/working/dir/file.txt

// 相对路径
console.log(path.relative('/home/user', '/home/user/file.txt')) // file.txt
```

### 10. 事件模块

```javascript
const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

// 监听事件
myEmitter.on('event', () => {
  console.log('Event occurred')
})

// 只监听一次
myEmitter.once('event', () => {
  console.log('Event occurred once')
})

// 触发事件
myEmitter.emit('event')

// 带参数的事件
myEmitter.on('data', (data) => {
  console.log('Received:', data)
})
myEmitter.emit('data', { message: 'Hello' })

// 错误处理
myEmitter.on('error', (err) => {
  console.error('Error:', err)
})
myEmitter.emit('error', new Error('Something went wrong'))
```

### 11. URL 模块

```javascript
const url = require('url')

// 解析 URL
const parsedUrl = url.parse('https://example.com:8080/path?query=value#hash')
console.log(parsedUrl)
// {
//   protocol: 'https:',
//   slashes: true,
//   auth: null,
//   host: 'example.com:8080',
//   port: '8080',
//   hostname: 'example.com',
//   hash: '#hash',
//   search: '?query=value',
//   query: 'query=value',
//   pathname: '/path',
//   path: '/path?query=value',
//   href: 'https://example.com:8080/path?query=value#hash'
// }

// 格式化 URL
const formattedUrl = url.format({
  protocol: 'https',
  hostname: 'example.com',
  pathname: '/path',
  query: { key: 'value' }
})

// 解析查询字符串
const query = url.parse('https://example.com?name=John&age=30', true).query
console.log(query) // { name: 'John', age: '30' }
```

### 12. 查询字符串模块

```javascript
const querystring = require('querystring')

// 解析查询字符串
const parsed = querystring.parse('name=John&age=30')
console.log(parsed) // { name: 'John', age: '30' }

// 字符串化对象
const stringified = querystring.stringify({ name: 'John', age: 30 })
console.log(stringified) // name=John&age=30

// URL 编码
const encoded = querystring.escape('hello world')
console.log(encoded) // hello%20world

// URL 解码
const decoded = querystring.decode('hello%20world')
console.log(decoded) // hello world
```

### 13. 加密模块

```javascript
const crypto = require('crypto')

// 创建哈希
const hash = crypto.createHash('sha256')
hash.update('Hello, World!')
console.log(hash.digest('hex'))

// HMAC
const hmac = crypto.createHmac('sha256', 'secret-key')
hmac.update('Hello, World!')
console.log(hmac.digest('hex'))

// 加密
const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

const cipher = crypto.createCipheriv(algorithm, key, iv)
let encrypted = cipher.update('Hello, World!', 'utf8', 'hex')
encrypted += cipher.final('hex')
console.log(encrypted)

// 解密
const decipher = crypto.createDecipheriv(algorithm, key, iv)
let decrypted = decipher.update(encrypted, 'hex', 'utf8')
decrypted += decipher.final('utf8')
console.log(decrypted)

// 随机数
const randomBytes = crypto.randomBytes(16)
console.log(randomBytes.toString('hex'))

// PBKDF2
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
  if (err) throw err
  console.log(derivedKey.toString('hex'))
})
```

### 14. OS 模块

```javascript
const os = require('os')

// 操作系统信息
console.log('Platform:', os.platform()) // darwin, win32, linux
console.log('Arch:', os.arch()) // x64, arm64
console.log('Release:', os.release())
console.log('Type:', os.type()) // Linux, Darwin, Windows_NT

// CPU 信息
console.log('CPUs:', os.cpus())
console.log('Total memory:', os.totalmem())
console.log('Free memory:', os.freemem())

// 网络接口
console.log('Network interfaces:', os.networkInterfaces())

// 用户信息
console.log('Home directory:', os.homedir())
console.log('Temp directory:', os.tmpdir())
console.log('Hostname:', os.hostname())

// 用户信息
console.log('User info:', os.userInfo())

// 系统运行时间
console.log('Uptime:', os.uptime())
```

### 15. Process 模块

```javascript
// 命令行参数
console.log('argv:', process.argv)
// node script.js arg1 arg2
// argv: ['/path/to/node', '/path/to/script.js', 'arg1', 'arg2']

// 环境变量
console.log('NODE_ENV:', process.env.NODE_ENV)

// 当前工作目录
console.log('CWD:', process.cwd())

// 退出进程
process.exit(1) // 非正常退出
process.exit(0) // 正常退出

// 退出事件
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`)
})

// 内存使用
console.log('Memory usage:', process.memoryUsage())

// CPU 使用
const startUsage = process.cpuUsage()

// 执行一些操作

const endUsage = process.cpuUsage(startUsage)
console.log('CPU usage:', endUsage)

// 信号处理
process.on('SIGINT', () => {
  console.log('Received SIGINT')
  process.exit(0)
})

// 未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
```

## 模块模式

### 16. 工厂模式

```javascript
// database.js
class Database {
  constructor(config) {
    this.config = config
    this.connection = null
  }

  async connect() {
    // 连接逻辑
    this.connection = 'connected'
  }

  async disconnect() {
    // 断开连接逻辑
    this.connection = null
  }
}

function createDatabase(config) {
  return new Database(config)
}

module.exports = createDatabase

// 使用
const createDatabase = require('./database')
const db = createDatabase({
  host: 'localhost',
  port: 5432
})
```

### 17. 单例模式

```javascript
// config.js
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance
    }

    this.settings = {}
    Config.instance = this
  }

  set(key, value) {
    this.settings[key] = value
  }

  get(key) {
    return this.settings[key]
  }
}

module.exports = new Config()

// 使用
const config = require('./config')
config.set('apiKey', '12345')
console.log(config.get('apiKey')) // 12345
```

### 18. 观察者模式

```javascript
// eventBus.js
const EventEmitter = require('events')

class EventBus extends EventEmitter {
  constructor() {
    super()
    this.events = {}
  }

  on(event, listener) {
    super.on(event, listener)
    return this
  }

  off(event, listener) {
    super.off(event, listener)
    return this
  }

  emit(event, ...args) {
    super.emit(event, ...args)
    return this
  }
}

module.exports = new EventBus()

// 使用
const eventBus = require('./eventBus')

eventBus.on('user:created', (user) => {
  console.log('User created:', user)
})

eventBus.emit('user:created', { id: 1, name: 'John' })
```

## 最佳实践

### 19. 模块组织

```
project/
├── src/
│   ├── config/
│   │   └── index.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── postController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── postRoutes.js
│   ├── services/
│   │   ├── userService.js
│   │   └── postService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── validator.js
│   └── index.js
├── tests/
├── package.json
└── README.md
```

### 20. 模块导出最佳实践

```javascript
// 好的做法：明确导出
module.exports = {
  add,
  subtract,
  multiply,
  divide
}

// 或使用 named exports
exports.add = add
exports.subtract = subtract
exports.multiply = multiply
exports.divide = divide

// 避免这样做：修改 exports 对象
exports = {
  add,
  subtract
} // 这不会导出任何东西

// 使用 ES6 模块时
export { add, subtract, multiply, divide }
export default { add, subtract, multiply, divide }
```

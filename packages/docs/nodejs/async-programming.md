# Node.js 异步编程

## 回调函数

### 1. 基本回调

```javascript
// 基本回调函数
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'John' }
    callback(null, data)
  }, 1000)
}

// 使用
fetchData((error, data) => {
  if (error) {
    console.error('Error:', error)
    return
  }
  console.log('Data:', data)
})
```

### 2. 回调地狱问题

```javascript
// 回调地狱（不推荐）
fs.readFile('file1.txt', 'utf8', (err, data1) => {
  if (err) return console.error(err)

  fs.readFile('file2.txt', 'utf8', (err, data2) => {
    if (err) return console.error(err)

    fs.readFile('file3.txt', 'utf8', (err, data3) => {
      if (err) return console.error(err)

      console.log(data1, data2, data3)
    })
  })
})
```

## Promise

### 3. Promise 基础

```javascript
// 创建 Promise
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true
    if (success) {
      resolve('Operation successful')
    } else {
      reject(new Error('Operation failed'))
    }
  }, 1000)
})

// 使用 Promise
myPromise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Promise completed'))
```

### 4. Promise 链式调用

```javascript
// Promise 链
function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id, name: 'John' })
    }, 1000)
  })
}

function getPosts(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { id: 1, userId, title: 'Post 1' },
        { id: 2, userId, title: 'Post 2' }
      ])
    }, 1000)
  })
}

// 链式调用
getUser(1)
  .then(user => {
    console.log('User:', user)
    return getPosts(user.id)
  })
  .then(posts => {
    console.log('Posts:', posts)
  })
  .catch(error => {
    console.error('Error:', error)
  })
```

### 5. Promise 静态方法

```javascript
// Promise.all - 所有 Promise 都成功
Promise.all([
  getUser(1),
  getUser(2),
  getUser(3)
])
  .then(users => console.log('All users:', users))
  .catch(error => console.error('Error:', error))

// Promise.race - 第一个完成的 Promise
Promise.race([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3()
])
  .then(result => console.log('First result:', result))

// Promise.allSettled - 所有 Promise 都完成（无论成功或失败）
Promise.allSettled([
  getUser(1),
  getUser(999), // 可能失败
  getUser(3)
])
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('Success:', result.value)
      } else {
        console.log('Failed:', result.reason)
      }
    })
  })

// Promise.any - 第一个成功的 Promise
Promise.any([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3()
])
  .then(result => console.log('First success:', result))
  .catch(error => console.error('All failed:', error))
```

## async/await

### 6. async/await 基础

```javascript
// async 函数返回 Promise
async function fetchData() {
  return { id: 1, name: 'John' }
}

// 等同于
function fetchData() {
  return Promise.resolve({ id: 1, name: 'John' })
}

// 使用 await
async function main() {
  try {
    const data = await fetchData()
    console.log('Data:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
```

### 7. async/await 并行处理

```javascript
// 串行执行（慢）
async function sequential() {
  const user1 = await getUser(1)
  const user2 = await getUser(2)
  const user3 = await getUser(3)
  return [user1, user2, user3]
}

// 并行执行（快）
async function parallel() {
  const [user1, user2, user3] = await Promise.all([
    getUser(1),
    getUser(2),
    getUser(3)
  ])
  return [user1, user2, user3]
}
```

### 8. 错误处理

```javascript
// try-catch 错误处理
async function handleErrors() {
  try {
    const user = await getUser(1)
    const posts = await getPosts(user.id)
    return { user, posts }
  } catch (error) {
    console.error('Error:', error)
    throw error // 重新抛出错误
  }
}

// 多个 try-catch
async function multipleErrors() {
  try {
    const user = await getUser(1)
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }

  try {
    const posts = await getPosts(1)
  } catch (error) {
    console.error('Get posts error:', error)
    return null
  }
}
```

## 事件循环

### 9. 事件循环基础

```javascript
// 事件循环示例
console.log('1. Script start')

setTimeout(() => {
  console.log('2. setTimeout')
}, 0)

Promise.resolve().then(() => {
  console.log('3. Promise.then')
})

console.log('4. Script end')

// 输出顺序：
// 1. Script start
// 4. Script end
// 3. Promise.then
// 2. setTimeout
```

### 10. 微任务和宏任务

```javascript
console.log('Start')

setTimeout(() => console.log('Macro task 1'), 0)

Promise.resolve().then(() => {
  console.log('Micro task 1')
  Promise.resolve().then(() => {
    console.log('Micro task 2')
  })
})

setTimeout(() => console.log('Macro task 2'), 0)

console.log('End')

// 输出顺序：
// Start
// End
// Micro task 1
// Micro task 2
// Macro task 1
// Macro task 2
```

## 实用工具

### 11. promisify

```javascript
const util = require('util')
const fs = require('fs')

// 将回调函数转换为 Promise
const readFile = util.promisify(fs.readFile)

async function readFiles() {
  try {
    const data = await readFile('example.txt', 'utf8')
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
```

### 12. 自定义 promisify

```javascript
// 手动实现 promisify
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}

// 使用
const readFile = promisify(fs.readFile)
```

### 13. async 函数组合

```javascript
// 管道式组合
const pipe = (...fns) => (x) => fns.reduce(async (v, f) => f(await v), x)

// 使用
const result = await pipe(
  async (x) => x * 2,
  async (x) => x + 1,
  async (x) => x * 3
)(5)

console.log(result) // 33
```

### 14. 并发控制

```javascript
// 限制并发数
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = []
  const executing = []

  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)

    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)

      if (executing.length >= poolLimit) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(ret)
}

// 使用
const urls = ['url1', 'url2', 'url3', 'url4', 'url5']
const results = await asyncPool(2, urls, fetchUrl)
```

## 实战示例

### 15. 文件操作

```javascript
const fs = require('fs').promises

async function processFiles() {
  try {
    // 读取文件
    const data = await fs.readFile('input.txt', 'utf8')

    // 处理数据
    const processed = data.toUpperCase()

    // 写入文件
    await fs.writeFile('output.txt', processed)

    console.log('File processed successfully')
  } catch (error) {
    console.error('Error processing file:', error)
  }
}
```

### 16. HTTP 请求

```javascript
const https = require('https')

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        resolve(JSON.parse(data))
      })
    }).on('error', (error) => {
      reject(error)
    })
  })
}

async function fetchData() {
  try {
    const data = await httpsGet('https://api.example.com/data')
    console.log(data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 17. 数据库操作

```javascript
const mongoose = require('mongoose')

async function connectAndQuery() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/mydb')

    // 查询数据
    const users = await User.find({ active: true })

    // 创建数据
    const user = await User.create({
      name: 'John',
      email: 'john@example.com'
    })

    console.log('Users:', users)
    console.log('Created user:', user)
  } catch (error) {
    console.error('Database error:', error)
  } finally {
    await mongoose.disconnect()
  }
}
```

## 最佳实践

### 18. 错误处理最佳实践

```javascript
// 始终处理错误
async function goodExample() {
  try {
    const result = await riskyOperation()
    return result
  } catch (error) {
    console.error('Operation failed:', error)
    // 可以选择：
    // 1. 返回默认值
    // 2. 重新抛出错误
    // 3. 记录错误并返回
    throw error
  }
}

// 避免未捕获的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})
```

### 19. 性能优化

```javascript
// 使用缓存
const cache = new Map()

async function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const data = await fetchDataFromDB(key)
  cache.set(key, data)
  return data
}

// 批量处理
async function batchProcess(items, batchSize = 10) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    )
    results.push(...batchResults)
  }

  return results
}
```

### 20. 调试技巧

```javascript
// 添加日志
async function debugExample() {
  console.log('Starting operation...')

  try {
    const result = await someAsyncOperation()
    console.log('Operation result:', result)
    return result
  } catch (error) {
    console.error('Operation failed:', error)
    throw error
  } finally {
    console.log('Operation completed')
  }
}

// 使用 async_hooks 追踪异步操作
const async_hooks = require('async_hooks')

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log(`Init: ${type} (id: ${asyncId}, trigger: ${triggerAsyncId})`)
  },
  before(asyncId) {
    console.log(`Before: ${asyncId}`)
  },
  after(asyncId) {
    console.log(`After: ${asyncId}`)
  }
})

hook.enable()
```

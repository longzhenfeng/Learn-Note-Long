# Node.js Stream 和 Buffer

## Buffer 基础

### 1. 创建 Buffer

```javascript
// 从字符串创建
const buf1 = Buffer.from('Hello')
const buf2 = Buffer.from('Hello', 'utf8')

// 指定大小创建
const buf3 = Buffer.alloc(10) // 创建 10 字节的 Buffer，初始化为 0
const buf4 = Buffer.allocUnsafe(10) // 创建 10 字节的 Buffer，不初始化（更快但不安全）

// 从数组创建
const buf5 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])

console.log(buf1) // <Buffer 48 65 6c 6c 6f>
console.log(buf1.toString()) // "Hello"
```

### 2. Buffer 操作

```javascript
const buf = Buffer.from('Hello World')

// 转换为字符串
console.log(buf.toString()) // "Hello World"
console.log(buf.toString('utf8', 0, 5)) // "Hello"

// 转换为 JSON
console.log(buf.toJSON()) // { type: 'Buffer', data: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100] }

// 获取长度
console.log(buf.length) // 11

// 读取和写入
const buf2 = Buffer.alloc(4)
buf2.write('ABCD')
console.log(buf2.toString()) // "ABCD"

// 比较两个 Buffer
const buf3 = Buffer.from('ABC')
const buf4 = Buffer.from('ABC')
console.log(buf3.equals(buf4)) // true

// 拼接 Buffer
const buf5 = Buffer.concat([Buffer.from('Hello '), Buffer.from('World')])
console.log(buf5.toString()) // "Hello World"

// 复制 Buffer
const buf6 = Buffer.alloc(5)
buf1.copy(buf6, 0, 0, 5)
console.log(buf6.toString()) // "Hello"
```

### 3. Buffer 编码

```javascript
const buf = Buffer.from('你好')

// UTF-8
console.log(buf.toString('utf8')) // "你好"

// Base64
console.log(buf.toString('base64')) // "5L2g5aW9"

// Hex
console.log(buf.toString('hex')) // "e4bda0e5a5bd"

// 从 Base64 解码
const base64Buf = Buffer.from('5L2g5aW9', 'base64')
console.log(base64Buf.toString('utf8')) // "你好"

// 从 Hex 解码
const hexBuf = Buffer.from('e4bda0e5a5bd', 'hex')
console.log(hexBuf.toString('utf8')) // "你好"
```

## Stream 基础

### 4. Stream 类型

```javascript
const fs = require('fs')

// Readable Stream - 可读流
const readableStream = fs.createReadStream('input.txt')

readableStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk)
})

readableStream.on('end', () => {
  console.log('Stream ended')
})

readableStream.on('error', (error) => {
  console.error('Error:', error)
})

// Writable Stream - 可写流
const writableStream = fs.createWriteStream('output.txt')

writableStream.write('Hello, ')
writableStream.write('World!')
writableStream.end()

writableStream.on('finish', () => {
  console.log('Write finished')
})

writableStream.on('error', (error) => {
  console.error('Error:', error)
})

// Duplex Stream - 双向流（可读可写）
const net = require('net')
const duplexStream = new net.Socket()

// Transform Stream - 转换流（可读可写，可修改数据）
const { Transform } = require('stream')

const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

transformStream.on('data', (chunk) => {
  console.log('Transformed:', chunk.toString())
})

transformStream.write('hello')
transformStream.end()
```

### 5. 管道（Pipe）

```javascript
const fs = require('fs')

// 简单的管道
const readable = fs.createReadStream('input.txt')
const writable = fs.createWriteStream('output.txt')

readable.pipe(writable)

// 链式管道
const zlib = require('zlib')

fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'))

// 带错误处理的管道
readable
  .on('error', (error) => {
    console.error('Readable error:', error)
  })
  .pipe(writable)
  .on('error', (error) => {
    console.error('Writable error:', error)
  })
```

### 6. Stream 事件

```javascript
const fs = require('fs')

const readable = fs.createReadStream('large-file.txt')

// data 事件 - 接收数据块
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`)
})

// end 事件 - 流结束
readable.on('end', () => {
  console.log('Stream finished')
})

// error 事件 - 发生错误
readable.on('error', (error) => {
  console.error('Error:', error)
})

// close 事件 - 流关闭
readable.on('close', () => {
  console.log('Stream closed')
})

// pause 和 resume - 暂停和恢复
readable.on('data', (chunk) => {
  readable.pause() // 暂停流
  console.log('Paused')

  setTimeout(() => {
    readable.resume() // 恢复流
    console.log('Resumed')
  }, 1000)
})
```

## 自定义 Stream

### 7. 自定义 Readable Stream

```javascript
const { Readable } = require('stream')

class MyReadable extends Readable {
  constructor(options) {
    super(options)
    this.count = 0
  }

  _read(size) {
    if (this.count >= 5) {
      this.push(null) // 结束流
      return
    }

    setTimeout(() => {
      this.push(`Chunk ${this.count}\n`)
      this.count++
    }, 100)
  }
}

const myReadable = new MyReadable()

myReadable.on('data', (chunk) => {
  console.log('Received:', chunk.toString())
})

myReadable.on('end', () => {
  console.log('Stream ended')
})
```

### 8. 自定义 Writable Stream

```javascript
const { Writable } = require('stream')

class MyWritable extends Writable {
  constructor(options) {
    super(options)
    this.chunks = []
  }

  _write(chunk, encoding, callback) {
    console.log('Writing:', chunk.toString())
    this.chunks.push(chunk)
    callback()
  }

  _final(callback) {
    console.log('All data written')
    callback()
  }
}

const myWritable = new MyWritable()

myWritable.write('Hello ')
myWritable.write('World!')
myWritable.end()
```

### 9. 自定义 Transform Stream

```javascript
const { Transform } = require('stream')

class UppercaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
}

class ReverseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().split('').reverse().join(''))
    callback()
  }
}

// 使用
const fs = require('fs')

fs.createReadStream('input.txt')
  .pipe(new UppercaseTransform())
  .pipe(new ReverseTransform())
  .pipe(fs.createWriteStream('output.txt'))
```

## 实用示例

### 10. 文件复制

```javascript
const fs = require('fs')

// 方法一：使用 pipe（推荐）
function copyFileWithPipe(source, destination) {
  const readable = fs.createReadStream(source)
  const writable = fs.createWriteStream(destination)

  readable.pipe(writable)

  return new Promise((resolve, reject) => {
    writable.on('finish', resolve)
    writable.on('error', reject)
  })
}

// 方法二：手动处理
function copyFileManual(source, destination) {
  const readable = fs.createReadStream(source)
  const writable = fs.createWriteStream(destination)

  return new Promise((resolve, reject) => {
    readable.on('data', (chunk) => {
      if (!writable.write(chunk)) {
        readable.pause()
      }
    })

    writable.on('drain', () => {
      readable.resume()
    })

    readable.on('end', () => {
      writable.end()
    })

    writable.on('finish', resolve)
    readable.on('error', reject)
    writable.on('error', reject)
  })
}

// 使用
copyFileWithPipe('input.txt', 'output.txt')
  .then(() => console.log('File copied'))
  .catch(error => console.error('Error:', error))
```

### 11. 压缩和解压

```javascript
const fs = require('fs')
const zlib = require('zlib')

// 压缩文件
function compressFile(input, output) {
  const gzip = zlib.createGzip()
  const inp = fs.createReadStream(input)
  const out = fs.createWriteStream(output)

  return new Promise((resolve, reject) => {
    inp.pipe(gzip).pipe(out)
    out.on('finish', resolve)
    out.on('error', reject)
  })
}

// 解压文件
function decompressFile(input, output) {
  const gunzip = zlib.createGunzip()
  const inp = fs.createReadStream(input)
  const out = fs.createWriteStream(output)

  return new Promise((resolve, reject) => {
    inp.pipe(gunzip).pipe(out)
    out.on('finish', resolve)
    out.on('error', reject)
  })
}

// 使用
compressFile('input.txt', 'input.txt.gz')
  .then(() => console.log('Compressed'))
  .then(() => decompressFile('input.txt.gz', 'output.txt'))
  .then(() => console.log('Decompressed'))
```

### 12. CSV 解析

```javascript
const fs = require('fs')
const { Transform } = require('stream')

class CSVParser extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true })
    this.buffer = ''
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString()
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() // 保留不完整的行

    lines.forEach(line => {
      if (line.trim()) {
        const fields = line.split(',')
        this.push(fields)
      }
    })

    callback()
  }

  _flush(callback) {
    if (this.buffer.trim()) {
      const fields = this.buffer.split(',')
      this.push(fields)
    }
    callback()
  }
}

// 使用
fs.createReadStream('data.csv')
  .pipe(new CSVParser())
  .on('data', (row) => {
    console.log('Parsed row:', row)
  })
```

### 13. 进度条

```javascript
const fs = require('fs')
const { Transform } = require('stream')

class ProgressTracker extends Transform {
  constructor(totalSize, options) {
    super(options)
    this.totalSize = totalSize
    this.progress = 0
  }

  _transform(chunk, encoding, callback) {
    this.progress += chunk.length
    const percent = ((this.progress / this.totalSize) * 100).toFixed(2)
    process.stdout.write(`\rProgress: ${percent}%`)
    this.push(chunk)
    callback()
  }
}

// 使用
const fs = require('fs')
const fsPromises = fs.promises

async function copyWithProgress(source, destination) {
  const stats = await fsPromises.stat(source)
  const totalSize = stats.size

  fs.createReadStream(source)
    .pipe(new ProgressTracker(totalSize))
    .pipe(fs.createWriteStream(destination))
    .on('finish', () => {
      console.log('\nCopy completed!')
    })
}

copyWithProgress('large-file.txt', 'copy.txt')
```

### 14. 流式 HTTP 响应

```javascript
const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
  const filePath = './large-file.txt'

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  })

  const readStream = fs.createReadStream(filePath)

  readStream.on('data', (chunk) => {
    res.write(chunk)
  })

  readStream.on('end', () => {
    res.end()
  })

  readStream.on('error', (error) => {
    console.error('Error:', error)
    res.statusCode = 500
    res.end('Internal Server Error')
  })
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

## 高级用法

### 15. 流式处理大文件

```javascript
const fs = require('fs')
const { Transform } = require('stream')

// 逐行处理大文件
class LineProcessor extends Transform {
  constructor(processor, options) {
    super({ ...options, objectMode: true })
    this.processor = processor
    this.buffer = ''
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString()
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop()

    for (const line of lines) {
      if (line.trim()) {
        try {
          const result = this.processor(line)
          if (result !== undefined) {
            this.push(result)
          }
        } catch (error) {
          this.emit('error', error)
        }
      }
    }

    callback()
  }

  _flush(callback) {
    if (this.buffer.trim()) {
      try {
        const result = this.processor(this.buffer)
        if (result !== undefined) {
          this.push(result)
        }
      } catch (error) {
        this.emit('error', error)
      }
    }
    callback()
  }
}

// 使用：统计大文件中的单词数
const wordCount = {}

fs.createReadStream('large-file.txt')
  .pipe(new LineProcessor((line) => {
    const words = line.toLowerCase().match(/\b\w+\b/g) || []
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  }))
  .on('finish', () => {
    console.log('Word counts:', wordCount)
  })
```

### 16. 流式 JSON 处理

```javascript
const fs = require('fs')
const { Transform } = require('stream')

class JSONParser extends Transform {
  constructor(options) {
    super(options)
    this.buffer = ''
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString()
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop()

    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line)
          this.push(obj)
        } catch (error) {
          // 忽略无效的 JSON 行
        }
      }
    }

    callback()
  }
}

// 使用：处理 JSON Lines 格式的文件
fs.createReadStream('data.jsonl')
  .pipe(new JSONParser())
  .on('data', (obj) => {
    console.log('Parsed object:', obj)
  })
```

### 17. 流式加密

```javascript
const fs = require('fs')
const crypto = require('crypto')

function encryptFile(input, output, password) {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(password, 'salt', 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)

  const inputStream = fs.createReadStream(input)
  const outputStream = fs.createWriteStream(output)

  // 写入 IV
  outputStream.write(iv)

  return new Promise((resolve, reject) => {
    inputStream
      .pipe(cipher)
      .pipe(outputStream)
      .on('finish', resolve)
      .on('error', reject)
  })
}

function decryptFile(input, output, password) {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(password, 'salt', 32)

  const inputStream = fs.createReadStream(input)
  const outputStream = fs.createWriteStream(output)

  let iv

  return new Promise((resolve, reject) => {
    inputStream.once('readable', () => {
      iv = inputStream.read(16)
      const decipher = crypto.createDecipheriv(algorithm, key, iv)

      inputStream
        .pipe(decipher)
        .pipe(outputStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  })
}

// 使用
encryptFile('input.txt', 'encrypted.bin', 'my-password')
  .then(() => console.log('Encrypted'))
  .then(() => decryptFile('encrypted.bin', 'decrypted.txt', 'my-password'))
  .then(() => console.log('Decrypted'))
```

### 18. 流式哈希计算

```javascript
const fs = require('fs')
const crypto = require('stream')
const { promisify } = require('util')

const pipeline = promisify(require('stream').pipeline)

async function calculateHash(filePath, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm)
  const inputStream = fs.createReadStream(filePath)

  await pipeline(inputStream, hash)

  return hash.digest('hex')
}

// 使用
calculateHash('large-file.txt')
  .then(hash => console.log('File hash:', hash))
  .catch(error => console.error('Error:', error))
```

## 最佳实践

### 19. Stream 错误处理

```javascript
const fs = require('fs')

function safePipe(readable, writable) {
  return new Promise((resolve, reject) => {
    let errorEmitted = false

    function handleError(error) {
      if (errorEmitted) return
      errorEmitted = true
      reject(error)
    }

    readable.on('error', handleError)
    writable.on('error', handleError)
    writable.on('finish', resolve)

    readable.pipe(writable)
  })
}

// 使用
safePipe(fs.createReadStream('input.txt'), fs.createWriteStream('output.txt'))
  .then(() => console.log('Success'))
  .catch(error => console.error('Error:', error))
```

### 20. 内存管理

```javascript
const { Transform } = require('stream')

// 控制数据流速度
class Throttle extends Transform {
  constructor(bytesPerSecond, options) {
    super(options)
    this.bytesPerSecond = bytesPerSecond
    this.lastTime = Date.now()
    this.bytesSent = 0
  }

  _transform(chunk, encoding, callback) {
    const now = Date.now()
    const elapsed = now - this.lastTime
    const allowedBytes = (elapsed / 1000) * this.bytesPerSecond

    if (this.bytesSent + chunk.length <= allowedBytes) {
      this.push(chunk)
      this.bytesSent += chunk.length
      callback()
    } else {
      const remaining = allowedBytes - this.bytesSent
      if (remaining > 0) {
        this.push(chunk.slice(0, remaining))
        this.bytesSent = allowedBytes
      }
      const delay = (chunk.length / this.bytesPerSecond) * 1000
      setTimeout(() => {
        this._transform(chunk.slice(remaining), encoding, callback)
      }, delay)
    }
  }
}

// 使用：限制下载速度
const fs = require('fs')

fs.createReadStream('large-file.txt')
  .pipe(new Throttle(1024 * 1024)) // 1MB/s
  .pipe(fs.createWriteStream('output.txt'))
```

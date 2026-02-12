# Express 文件上传

## Multer 基础

### 1. 基本配置

```javascript
const multer = require('multer')

// 内存存储
const upload = multer({
  storage: multer.memoryStorage()
})

// 磁盘存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
```

### 2. 单文件上传

```javascript
// 单文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  res.json({
    message: 'File uploaded successfully',
    file: req.file
  })
})

// 响应示例
{
  "message": "File uploaded successfully",
  "file": {
    "fieldname": "file",
    "originalname": "example.jpg",
    "encoding": "7bit",
    "mimetype": "image/jpeg",
    "destination": "uploads/",
    "filename": "file-1234567890-123456789",
    "path": "uploads/file-1234567890-123456789",
    "size": 123456
  }
}
```

### 3. 多文件上传

```javascript
// 多文件上传 - 同一字段
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' })
  }

  res.json({
    message: 'Files uploaded successfully',
    files: req.files
  })
})

// 多文件上传 - 不同字段
const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
])

app.post('/upload-fields', uploadFields, (req, res) => {
  res.json({
    avatar: req.files['avatar'],
    gallery: req.files['gallery']
  })
})
```

## 文件类型限制

### 4. 文件过滤

```javascript
// 允许的文件类型
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})
```

### 5. 文件大小限制

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// 处理文件过大错误
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the 5MB limit' })
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' })
    }
  }
  next(err)
})
```

## 图片处理

### 6. Sharp 图片处理

```javascript
const sharp = require('sharp')

app.post('/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    // 生成不同尺寸的缩略图
    const filename = req.file.filename
    const originalPath = `uploads/${filename}`

    // 原图
    await sharp(originalPath)
      .jpeg({ quality: 80 })
      .toFile(`uploads/original-${filename}`)

    // 中等尺寸
    await sharp(originalPath)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(`uploads/medium-${filename}`)

    // 小尺寸
    await sharp(originalPath)
      .resize(400, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(`uploads/small-${filename}`)

    res.json({
      message: 'Image processed successfully',
      images: {
        original: `/uploads/original-${filename}`,
        medium: `/uploads/medium-${filename}`,
        small: `/uploads/small-${filename}`
      }
    })
  } catch (error) {
    next(error)
  }
})
```

### 7. 图片裁剪

```javascript
app.post('/crop-image', upload.single('image'), async (req, res, next) => {
  try {
    const { x, y, width, height } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    const croppedImage = await sharp(req.file.path)
      .extract({
        left: parseInt(x),
        top: parseInt(y),
        width: parseInt(width),
        height: parseInt(height)
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    const filename = `cropped-${Date.now()}.jpg`
    const filepath = `uploads/${filename}`

    await fs.promises.writeFile(filepath, croppedImage)

    res.json({
      message: 'Image cropped successfully',
      image: `/uploads/${filename}`
    })
  } catch (error) {
    next(error)
  }
})
```

## 云存储

### 8. AWS S3 上传

```javascript
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')

// 配置 S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

// S3 上传配置
const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
})

// 上传到 S3
app.post('/upload-s3', uploadS3.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  res.json({
    message: 'File uploaded to S3 successfully',
    file: {
      url: req.file.location,
      key: req.file.key,
      size: req.file.size
    }
  })
})
```

### 9. 阿里云 OSS 上传

```javascript
const OSS = require('ali-oss')

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
})

app.post('/upload-oss', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filename = `${Date.now()}-${req.file.originalname}`

    const result = await client.put(filename, req.file.path, {
      headers: {
        'Content-Type': req.file.mimetype
      }
    })

    // 删除本地文件
    await fs.promises.unlink(req.file.path)

    res.json({
      message: 'File uploaded to OSS successfully',
      file: {
        url: result.url,
        name: result.name
      }
    })
  } catch (error) {
    next(error)
  }
})
```

## 用户头像上传

### 10. 用户头像上传

```javascript
const User = require('../models/User')

app.post('/users/:id/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return next(new AppError('User not found', 404))
    }

    if (!req.file) {
      return next(new AppError('Please upload an avatar', 400))
    }

    // 删除旧头像
    if (user.avatar && user.avatar !== 'default-avatar.jpg') {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar)
      if (fs.existsSync(oldAvatarPath)) {
        await fs.promises.unlink(oldAvatarPath)
      }
    }

    // 处理新头像
    const filename = `avatar-${user.id}-${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(__dirname, '..', 'uploads', 'avatars', filename)

    await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(filepath)

    // 更新用户头像
    user.avatar = `/uploads/avatars/${filename}`
    await user.save()

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    })
  } catch (error) {
    next(error)
  }
})
```

## 文件下载

### 11. 文件下载

```javascript
// 下载文件
app.get('/download/:filename', (req, res, next) => {
  const filename = req.params.filename
  const filepath = path.join(__dirname, '..', 'uploads', filename)

  if (!fs.existsSync(filepath)) {
    return next(new AppError('File not found', 404))
  }

  res.download(filepath, (err) => {
    if (err) {
      next(err)
    }
  })
})

// 流式下载
app.get('/stream/:filename', (req, res, next) => {
  const filename = req.params.filename
  const filepath = path.join(__dirname, '..', 'uploads', filename)

  if (!fs.existsSync(filepath)) {
    return next(new AppError('File not found', 404))
  }

  const stat = fs.statSync(filepath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    const chunksize = (end - start) + 1
    const file = fs.createReadStream(filepath, { start, end })

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    }

    res.writeHead(200, head)
    fs.createReadStream(filepath).pipe(res)
  }
})
```

## 文件删除

### 12. 文件删除

```javascript
app.delete('/files/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename
    const filepath = path.join(__dirname, '..', 'uploads', filename)

    if (!fs.existsSync(filepath)) {
      return next(new AppError('File not found', 404))
    }

    await fs.promises.unlink(filepath)

    res.json({
      message: 'File deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})
```

## 批量上传

### 13. 拖拽上传

```javascript
app.post('/upload-drag-drop', upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400))
    }

    const uploadedFiles = []

    for (const file of req.files) {
      // 处理每个文件
      const processedFile = await processFile(file)
      uploadedFiles.push(processedFile)
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    })
  } catch (error) {
    next(error)
  }
})

async function processFile(file) {
  // 文件处理逻辑
  return {
    originalname: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`
  }
}
```

## 进度上传

### 14. 分块上传

```javascript
const chunks = new Map()

app.post('/upload-chunk', (req, res) => {
  const { fileId, chunkIndex, totalChunks, filename } = req.headers
  const chunkData = []

  req.on('data', (data) => {
    chunkData.push(data)
  })

  req.on('end', () => {
    const chunk = Buffer.concat(chunkData)

    if (!chunks.has(fileId)) {
      chunks.set(fileId, {
        filename,
        totalChunks: parseInt(totalChunks),
        chunks: new Array(parseInt(totalChunks))
      })
    }

    const fileData = chunks.get(fileId)
    fileData.chunks[parseInt(chunkIndex)] = chunk

    const receivedChunks = fileData.chunks.filter(c => c).length

    res.json({
      received: receivedChunks,
      total: fileData.totalChunks
    })
  })
})

app.post('/merge-chunks', (req, res) => {
  const { fileId } = req.body

  if (!chunks.has(fileId)) {
    return res.status(404).json({ error: 'File not found' })
  }

  const fileData = chunks.get(fileId)
  const filename = `${Date.now()}-${fileData.filename}`
  const filepath = path.join(__dirname, '..', 'uploads', filename)

  const mergedFile = Buffer.concat(fileData.chunks)
  fs.writeFileSync(filepath, mergedFile)

  chunks.delete(fileId)

  res.json({
    message: 'File merged successfully',
    filename
  })
})
```

## 安全考虑

### 15. 文件安全

```javascript
const path = require('path')

// 验证文件名
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}

// 文件上传中间件
const secureUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname)
      const name = sanitizeFilename(path.basename(file.originalname, ext))
      cb(null, `${name}-${uniqueSuffix}${ext}`)
    }
  }),
  fileFilter: (req, file, cb) => {
    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']

    if (!allowedExts.includes(ext)) {
      return cb(new Error('File type not allowed'), false)
    }

    // 检查 MIME 类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid MIME type'), false)
    }

    cb(null, true)
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  }
})
```

### 16. 病毒扫描

```javascript
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

const scanFile = async (filepath) => {
  try {
    const { stdout } = await execPromise(`clamscan ${filepath}`)
    if (stdout.includes('OK')) {
      return true
    }
    return false
  } catch (error) {
    console.error('Virus scan error:', error)
    return false
  }
}

app.post('/upload-secure', secureUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400))
    }

    // 扫描病毒
    const isClean = await scanFile(req.file.path)

    if (!isClean) {
      // 删除感染的文件
      await fs.promises.unlink(req.file.path)
      return next(new AppError('File is infected', 400))
    }

    res.json({
      message: 'File uploaded and scanned successfully',
      file: req.file
    })
  } catch (error) {
    next(error)
  }
})
```

## 最佳实践

### 17. 文件上传最佳实践

```javascript
// 1. 使用内存存储处理小文件
const smallFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 } // 1MB
})

// 2. 使用磁盘存储处理大文件
const largeFileUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

// 3. 始终验证文件类型和大小
const validateFile = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400))
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (req.file.size > maxSize) {
    return next(new AppError('File too large', 400))
  }

  next()
}

// 4. 使用 CDN 存储生产环境文件
const uploadToCDN = async (file) => {
  // 上传到 CDN 的逻辑
  return { url: 'https://cdn.example.com/file.jpg' }
}

// 5. 清理未使用的文件
const cleanupFiles = async () => {
  const files = await fs.promises.readdir('uploads')
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天

  for (const file of files) {
    const filepath = path.join('uploads', file)
    const stats = await fs.promises.stat(filepath)

    if (now - stats.mtimeMs > maxAge) {
      await fs.promises.unlink(filepath)
    }
  }
}

// 定期清理
setInterval(cleanupFiles, 24 * 60 * 60 * 1000) // 每天
```

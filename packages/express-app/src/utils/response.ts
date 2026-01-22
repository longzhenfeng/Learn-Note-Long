/**
 * 自定义错误类
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

/**
 * 请求成功
 */
export const successResponse = (res: any, message = '请求成功', data = {}, code = 200) => {
  res.status(code).json({
    success: true,
    message,
    data,
  })
}
/**
 * 请求失败
 */
export const failureResponse = (res: any, err: any) => {
  if(err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e: any) => e.message)
    return res.status(400).json({
      success: false,
      message: "参数错误",
      errors: messages,
    })
  }
  if(err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: err.message,
    })
  }
  res.status(500).json({
    success: false,
    message: '服务器错误',
  })
}
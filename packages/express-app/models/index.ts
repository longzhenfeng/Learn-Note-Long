import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import { fileURLToPath } from 'url'
import configFile from '../config/config.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const env = process.env.NODE_ENV || 'development'
const config = configFile[env]

const db: any = {}

let sequelize:any
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )
}

const basename = path.basename(__filename)

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.js')
    )
  })
  .forEach(async file => {
    const { default: modelDef } = await import(
      path.join(__dirname, file)
    )

    const model = modelDef(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export {
  sequelize,
  Sequelize
}

export default db

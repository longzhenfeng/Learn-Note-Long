import mongoose from 'mongoose';
import User from './src/models/User';
import dotenv from 'dotenv';
dotenv.config();

const viewData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/express-app';
    await mongoose.connect(mongoUri);
    console.log('✅ 连接成功\n');

    const users = await User.find().lean();
    
    console.log(`📦 共有 ${users.length} 个用户:\n`);
    console.table(users.map(u => ({
      ID: u._id.toString(),
      姓名: u.name,
      年龄: u.age,
      角色: u.role,
      地址: u.address
    })));

  } catch (error) {
    console.error('❌ 出错了:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

viewData();

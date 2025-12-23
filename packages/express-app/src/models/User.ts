import mongoose, { Document, Schema } from 'mongoose';

// 用户权限枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

// 用户接口
export interface IUser extends Document {
  name: string;
  age: number;
  address: string;
  hobbies: string[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// 用户 Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, '姓名是必填项'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, '年龄是必填项'],
      min: [0, '年龄不能为负数'],
      max: [150, '年龄不能超过150'],
    },
    address: {
      type: String,
      required: [true, '地址是必填项'],
      trim: true,
    },
    hobbies: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;

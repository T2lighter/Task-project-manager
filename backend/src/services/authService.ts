import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const register = async (username: string, password: string, email: string) => {
  // 检查用户名是否已存在
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('用户名已存在');
  }

  // 检查邮箱是否已存在
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new Error('邮箱已被注册');
  }

  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建新用户
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  return user;
};

export const login = async (username: string, password: string) => {
  // 查找用户
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  // 生成JWT令牌
  const token = generateToken(user.id, user.username);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};
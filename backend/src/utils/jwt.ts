import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  username: string;
}

export const generateToken = (userId: number, username: string): string => {
  return jwt.sign({ userId, username }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
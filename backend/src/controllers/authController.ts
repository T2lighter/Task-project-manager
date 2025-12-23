import { Request, Response } from 'express';
import { register, login } from '../services/authService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    const user = await register(username, password, email);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const { token, user } = await login(username, password);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};
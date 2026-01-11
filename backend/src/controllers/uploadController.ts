import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }

    const imageUrl = `/api/uploads/${req.file.filename}`;
    
    res.status(201).json({ 
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: '文件名不能为空' });
    }

    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: '文件已删除' });
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};
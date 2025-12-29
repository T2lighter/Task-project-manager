import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/projectNoteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 项目记录路由
router.post('/projects/:projectId/notes', authMiddleware, createNote);
router.get('/projects/:projectId/notes', authMiddleware, getNotes);
router.get('/notes/:noteId', authMiddleware, getNote);
router.put('/notes/:noteId', authMiddleware, updateNote);
router.delete('/notes/:noteId', authMiddleware, deleteNote);

export default router;
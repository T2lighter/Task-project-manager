import express from 'express';
import {
  createNewProject,
  getAllProjects,
  getProject,
  updateExistingProject,
  deleteExistingProject
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Define routes
router.post('/', createNewProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.put('/:id', updateExistingProject);
router.delete('/:id', deleteExistingProject);

export default router;
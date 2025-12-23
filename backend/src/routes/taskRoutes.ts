import { Router } from 'express';
import { 
  createNewTask, 
  getAllTasks, 
  getTask, 
  updateExistingTask, 
  deleteExistingTask,
  getTasksByQuadrantHandler
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createNewTask);
router.get('/', getAllTasks);
router.get('/quadrant', getTasksByQuadrantHandler);
router.get('/:id', getTask);
router.put('/:id', updateExistingTask);
router.delete('/:id', deleteExistingTask);

export default router;
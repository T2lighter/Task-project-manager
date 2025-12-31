import { Router } from 'express';
import { 
  createNewTask, 
  getAllTasks, 
  getTask, 
  updateExistingTask, 
  deleteExistingTask,
  getTasksByQuadrantHandler,
  createNewSubtask,
  getTaskSubtasks,
  getMainTasksHandler,
  copyTaskHandler
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createNewTask);
router.get('/', getAllTasks);
router.get('/main', getMainTasksHandler); // 获取主任务列表
router.get('/quadrant', getTasksByQuadrantHandler);
router.get('/:id', getTask);
router.put('/:id', updateExistingTask);
router.delete('/:id', deleteExistingTask);
router.post('/:id/copy', copyTaskHandler); // 复制任务

// 子任务相关路由
router.post('/:parentTaskId/subtasks', createNewSubtask); // 创建子任务
router.get('/:parentTaskId/subtasks', getTaskSubtasks);   // 获取子任务列表

export default router;
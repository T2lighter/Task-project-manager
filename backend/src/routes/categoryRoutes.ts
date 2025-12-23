import { Router } from 'express';
import { 
  createNewCategory, 
  getAllCategories, 
  updateExistingCategory, 
  deleteExistingCategory 
} from '../controllers/categoryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createNewCategory);
router.get('/', getAllCategories);
router.put('/:id', updateExistingCategory);
router.delete('/:id', deleteExistingCategory);

export default router;
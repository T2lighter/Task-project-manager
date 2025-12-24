import { Router } from 'express';
import {
  getTaskStatsHandler,
  getQuadrantStatsHandler,
  getTimeSeriesDataHandler,
  getYearTimeSeriesDataHandler,
  getCategoryStatsHandler
} from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, getTaskStatsHandler);
router.get('/quadrant-stats', authMiddleware, getQuadrantStatsHandler);
router.get('/time-series', authMiddleware, getTimeSeriesDataHandler);
router.get('/time-series-year', authMiddleware, getYearTimeSeriesDataHandler);
router.get('/category-stats', authMiddleware, getCategoryStatsHandler);

export default router;
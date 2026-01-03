import { Router } from 'express';
import {
  getTaskStatsHandler,
  getQuadrantStatsHandler,
  getTimeSeriesDataHandler,
  getYearTimeSeriesDataHandler,
  getCategoryStatsHandler,
  getProjectStatsHandler,
  getProjectTaskStatsHandler,
  getTaskDurationRankingHandler
} from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, getTaskStatsHandler);
router.get('/quadrant-stats', authMiddleware, getQuadrantStatsHandler);
router.get('/time-series', authMiddleware, getTimeSeriesDataHandler);
router.get('/time-series-year', authMiddleware, getYearTimeSeriesDataHandler);
router.get('/category-stats', authMiddleware, getCategoryStatsHandler);
router.get('/project-stats', authMiddleware, getProjectStatsHandler);
router.get('/project-task-stats', authMiddleware, getProjectTaskStatsHandler);
router.get('/task-duration-ranking', authMiddleware, getTaskDurationRankingHandler);

export default router;
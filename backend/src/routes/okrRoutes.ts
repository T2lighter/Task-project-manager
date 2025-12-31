import express from 'express';
import {
  createNewObjective,
  getProjectObjectives,
  getObjective,
  updateExistingObjective,
  deleteExistingObjective,
  createNewKeyResult,
  updateExistingKeyResult,
  deleteExistingKeyResult,
  createNewKeyResultUpdate,
  createNewResourceRequirement,
  updateExistingResourceRequirement,
  deleteExistingResourceRequirement,
  createNewExecutionPlan,
  updateExistingExecutionPlan,
  deleteExistingExecutionPlan,
  createNewActionCheck,
  updateExistingActionCheck,
  deleteExistingActionCheck
} from '../controllers/okrController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Objective routes
router.post('/objectives', createNewObjective);
router.get('/projects/:projectId/objectives', getProjectObjectives);
router.get('/objectives/:id', getObjective);
router.put('/objectives/:id', updateExistingObjective);
router.delete('/objectives/:id', deleteExistingObjective);

// KeyResult routes
router.post('/key-results', createNewKeyResult);
router.put('/key-results/:id', updateExistingKeyResult);
router.delete('/key-results/:id', deleteExistingKeyResult);

// KeyResultUpdate routes
router.post('/key-result-updates', createNewKeyResultUpdate);

// ResourceRequirement routes
router.post('/resource-requirements', createNewResourceRequirement);
router.put('/resource-requirements/:id', updateExistingResourceRequirement);
router.delete('/resource-requirements/:id', deleteExistingResourceRequirement);

// ExecutionPlan routes
router.post('/execution-plans', createNewExecutionPlan);
router.put('/execution-plans/:id', updateExistingExecutionPlan);
router.delete('/execution-plans/:id', deleteExistingExecutionPlan);

// ActionCheck routes
router.post('/action-checks', createNewActionCheck);
router.put('/action-checks/:id', updateExistingActionCheck);
router.delete('/action-checks/:id', deleteExistingActionCheck);

export default router;
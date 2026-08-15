import { Router } from 'express';
import SearchController from './search.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { globalSearchQuerySchema } from './search.validation.js';

const router = Router();

// Protect search endpoint with authentication
router.use(authenticate);

// GET /api/v1/search
router.get('/', validateRequest(globalSearchQuerySchema), SearchController.search);

export default router;

import { Router } from 'express';
import QrController from './qr.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { verifyQrParamSchema, generateQrParamSchema } from './qr.validation.js';

const router = Router();

/**
 * Public Verification Endpoint
 * GET /verify/:qr or GET /api/v1/verify/:qr
 */
router.get('/verify/:qr', validateRequest(verifyQrParamSchema), QrController.verifyQrCode);
router.get('/:qr', validateRequest(verifyQrParamSchema), QrController.verifyQrCode);

/**
 * Authenticated QR Generation Endpoint
 * POST /api/v1/qr/generate/:id
 */
router.post('/generate/:id', authenticate, validateRequest(generateQrParamSchema), QrController.generateQrCode);

export default router;

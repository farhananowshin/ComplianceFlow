import { Router } from 'express';
import AuthController from './auth.controller.js';
import validateRequest from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.validation.js';

const router = Router();

/**
 * Public Authentication Routes
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);

/**
 * Protected Authentication Routes (Require valid token/session)
 */
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.patch('/profile', authenticate, validateRequest(updateProfileSchema), AuthController.updateProfile);
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;

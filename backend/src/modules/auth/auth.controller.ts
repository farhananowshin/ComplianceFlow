import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import AuthService from './auth.service.js';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register new compliance user
   */
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body, req.ip, req.get('user-agent'));
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Account registered successfully.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate compliance user and start session
   */
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body, req.ip, req.get('user-agent'));
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Authenticated successfully.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Invalidate session and logout
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const email = req.user?.email || '';
      const role = req.user?.role || '';
      const companyId = req.user?.companyId;

      const result = await AuthService.logout(userId, email, role, companyId, req.ip, req.get('user-agent'));
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Send password reset dispatch
   */
  static async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with valid token
   */
  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   * Change password for logged in user
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const headers = (req.headers || {}) as Record<string, string>;
      const result = await AuthService.changePassword(userId, req.body, headers);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get active authenticated user profile
   */
  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const user = await AuthService.getCurrentUser(userId);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Current user profile retrieved.',
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/profile
   * Update active user profile info
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const updatedUser = await AuthService.updateProfile(userId, req.body);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Profile updated successfully.',
        data: { user: updatedUser },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import QrService from './qr.service.js';

export class QrController {
  /**
   * POST /api/v1/qr/generate/:id or /api/v1/compliance/:id/generate-qr
   * Generate UUID & QR Code for Compliance Record
   */
  static async generateQrCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const complianceId = req.params.id;
      const result = await QrService.generateQrCode(complianceId, req.user!);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'QR Code generated and saved successfully.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /verify/:qr or /api/v1/verify/:qr
   * Public QR Verification Endpoint
   */
  static async verifyQrCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const qrParam = req.params.qr;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const verificationResult = await QrService.verifyQrCode(qrParam, clientIp, userAgent);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Compliance QR code verified successfully.',
        data: verificationResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default QrController;

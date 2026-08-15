import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

/**
 * Express Middleware to validate incoming request body, query, or params against a Zod Schema
 */
export const validateRequest = (schema: ZodType<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = validatedData.body;
      req.query = validatedData.query as any;
      req.params = validatedData.params as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.').replace(/^body\.|^query\.|^params\./, ''),
          message: issue.message,
        }));

        const errorDetails = formattedErrors.map(e => `${e.field}: ${e.message}`).join('; ');

        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: `Validation failed - ${errorDetails}`,
          errors: formattedErrors,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
};

export default validateRequest;

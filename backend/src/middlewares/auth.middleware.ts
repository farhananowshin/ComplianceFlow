import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser } from '../common/types/express.types.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';
import { UserModel } from '../modules/user/user.model.js';
import auth from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';

/**
 * Middleware to authenticate requests using Better Auth session or Bearer Token headers.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Try Better Auth session resolution
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    let resolvedUserId: string | null = null;
    let resolvedUserEmail: string | null = null;

    if (session && session.user) {
      resolvedUserId = session.user.id;
      resolvedUserEmail = session.user.email;
    } else {
      if (!token) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Authentication token or session missing. Please log in.', timestamp: new Date().toISOString() });
        return;
      }
      
      console.log("Falling back to manual JWT check...");
      try {
        const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || 'complianceflow_default_dev_secret_key_12345');
        const { payload: decoded } = await jwtVerify(token, secret);
        console.log("Decoded JWT payload keys:", Object.keys(decoded));
        
        // Better Auth JWT payload structure might vary, attempt to extract user info
        if (decoded.user && (decoded.user as any).id) {
           resolvedUserId = (decoded.user as any).id;
           resolvedUserEmail = (decoded.user as any).email;
        } else if (decoded.session && (decoded.session as any).userId) {
           resolvedUserId = (decoded.session as any).userId;
        } else if (decoded.userId || decoded.sub || decoded.id) {
           resolvedUserId = String(decoded.userId || decoded.sub || decoded.id);
        } else {
           res.status(401).json({ status: 'error', statusCode: 401, message: 'Invalid JWT structure', timestamp: new Date().toISOString() });
           return;
        }
      } catch (jwtErr) {
        console.error("JWT Verification failed:", jwtErr);
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Session resolution failed for token', timestamp: new Date().toISOString() });
        return;
      }
    }

    let dbUser = null;
    if (resolvedUserId) {
      dbUser = await UserModel.findById(resolvedUserId).catch(() => null);
    } 
    if (!dbUser && resolvedUserEmail) {
      dbUser = await UserModel.findOne({ email: resolvedUserEmail });
    }

    if (!dbUser) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authenticated user profile not found or has been removed.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.INACTIVE) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Your account is inactive or suspended. Contact your compliance administrator.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Populate Request Context
    const authUserPayload: AuthUser = {
      id: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      status: dbUser.status as UserStatus,
      companyId: dbUser.companyId ? dbUser.companyId.toString() : undefined,
      departmentId: dbUser.departmentId ? dbUser.departmentId.toString() : undefined,
      isMfaEnabled: dbUser.isMfaEnabled,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    req.user = authUserPayload;
    req.tenantId = authUserPayload.companyId;

    if (session?.session) {
      req.session = {
        id: session.session.id,
        userId: session.session.userId,
        token: session.session.token || token || '',
        expiresAt: new Date(session.session.expiresAt),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };
    }

    next();
  } catch (error) {
    console.error('❌ Authentication Middleware Failure:', error);
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Invalid or expired authentication session.',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Authorization Middleware: Grants access only if user has one of the allowed roles.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'User authentication context missing.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: `Forbidden. Role '${req.user.role}' lacks permission to access this resource.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

export default { authenticate, authorizeRoles };

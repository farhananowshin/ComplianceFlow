import auth from '../../config/auth.js';
import UserModel, { IUser } from '../user/user.model.js';
import CompanyModel from '../company/company.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { AuditAction, AuditEntity, CompanyStatus } from '../../common/constants/enums.js';
import { UserRole, UserStatus } from '../../common/types/role.types.js';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from './auth.validation.js';

/**
 * Generate a short, unique company code from the company name.
 * e.g. "Bengal Manufacturing Ltd." → "BENGAL-A3F2"
 */
function generateCompanyCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .split(' ')[0]
    .substring(0, 8);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export class AuthService {
  /**
   * Register a new user in ComplianceFlow.
   *
   * Two modes:
   *   - "create" (companyName provided): Creates a new Company + first ADMIN user.
   *   - "join"   (companyCode provided): Finds the existing Company and registers
   *              the user as a PENDING EMPLOYEE awaiting admin approval.
   */
  static async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    // 1. Prevent duplicate email registrations
    const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      const error = new Error('User with this email address already exists.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // ----------------------------------------------------------------
    // MODE: "create" — Register a new company and make this user ADMIN
    // ----------------------------------------------------------------
    if (input.companyName && input.companyName.trim().length >= 2) {
      // Generate a unique company code
      let companyCode = generateCompanyCode(input.companyName);
      // Ensure uniqueness (retry once if collision)
      const codeExists = await CompanyModel.findOne({ code: companyCode, isDeleted: false });
      if (codeExists) {
        companyCode = generateCompanyCode(input.companyName);
      }

      // Create the Company document
      const company = await CompanyModel.create({
        name: input.companyName.trim(),
        code: companyCode,
        registrationNumber: `REG-${Date.now()}`,  // Auto-generated; admin can update later
        industry: input.industry || 'General',
        contactEmail: input.email.toLowerCase(),
        status: CompanyStatus.ACTIVE,
        isDeleted: false,
      });

      // Register with Better Auth (handles password hashing + session)
      let authResult;
      try {
        authResult = await auth.api.signUpEmail({
          body: {
            email: input.email.toLowerCase(),
            password: input.password,
            name: input.name,
          },
        });
      } catch (authErr: any) {
        // If Better Auth fails, clean up the company we just created
        await CompanyModel.deleteOne({ _id: company._id });
        throw new Error(authErr?.message || 'Authentication provider failed to create account.');
      }

      // Create the User document with ADMIN role linked to the new company
      const dbUser = await UserModel.create({
        name: input.name,
        email: input.email.toLowerCase(),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        companyId: company._id,
        phoneNumber: input.phoneNumber || '',
      });

      // Audit log
      await AuditLogModel.create({
        userId: dbUser._id,
        userEmail: dbUser.email,
        userRole: dbUser.role,
        companyId: company._id,
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
        entityId: dbUser._id.toString(),
        details: { method: 'EMAIL_REGISTER', role: dbUser.role, companyName: company.name, companyCode: company.code },
        ipAddress: ipAddress || '',
        userAgent: userAgent || '',
      }).catch(() => {/* audit failures are non-fatal */});

      return {
        user: {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status,
          companyId: company._id.toString(),
          createdAt: dbUser.createdAt,
        },
        company: {
          id: company._id.toString(),
          name: company.name,
          code: company.code,
          industry: company.industry,
        },
        token: authResult?.token || null,
      };
    }

    // ----------------------------------------------------------------
    // MODE: "join" — Join an existing company using companyCode
    // ----------------------------------------------------------------
    if (input.companyCode && input.companyCode.trim().length >= 2) {
      const company = await CompanyModel.findOne({
        code: input.companyCode.trim().toUpperCase(),
        isDeleted: false,
        status: CompanyStatus.ACTIVE,
      });

      if (!company) {
        const error = new Error(
          `No active company found with code '${input.companyCode.trim().toUpperCase()}'. Please verify with your administrator.`
        ) as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }

      // Register with Better Auth
      let authResult;
      try {
        authResult = await auth.api.signUpEmail({
          body: {
            email: input.email.toLowerCase(),
            password: input.password,
            name: input.name,
          },
        });
      } catch (authErr: any) {
        throw new Error(authErr?.message || 'Authentication provider failed to create account.');
      }

      // Create the User document as PENDING EMPLOYEE — admin must approve
      const dbUser = await UserModel.create({
        name: input.name,
        email: input.email.toLowerCase(),
        role: UserRole.EMPLOYEE,
        status: UserStatus.PENDING,
        companyId: company._id,
        phoneNumber: input.phoneNumber || '',
      });

      // Audit log
      await AuditLogModel.create({
        userId: dbUser._id,
        userEmail: dbUser.email,
        userRole: dbUser.role,
        companyId: company._id,
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
        entityId: dbUser._id.toString(),
        details: { method: 'EMAIL_JOIN_COMPANY', role: dbUser.role, companyCode: input.companyCode },
        ipAddress: ipAddress || '',
        userAgent: userAgent || '',
      }).catch(() => {/* audit failures are non-fatal */});

      return {
        user: {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status,
          companyId: company._id.toString(),
          createdAt: dbUser.createdAt,
        },
        company: {
          id: company._id.toString(),
          name: company.name,
          code: company.code,
        },
        token: authResult?.token || null,
      };
    }

    // ----------------------------------------------------------------
    // FALLBACK — Neither companyName nor companyCode provided
    // ----------------------------------------------------------------
    const error = new Error(
      'Registration requires either a company name (to create a new company) or a company code (to join an existing company).'
    ) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }


  /**
   * Authenticate user with Email and Password
   */
  static async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const dbUser = await UserModel.findOne({ email: input.email.toLowerCase() }).select('+password');

    if (!dbUser) {
      const error = new Error('Invalid email or password credentials.') as Error & { statusCode?: number };
      error.statusCode = 401;
      throw error;
    }

    if (dbUser.status === UserStatus.SUSPENDED || dbUser.status === UserStatus.INACTIVE) {
      const error = new Error('Account is inactive or suspended.') as Error & { statusCode?: number };
      error.statusCode = 403;
      throw error;
    }

    // Perform sign-in via Better Auth
    const signInResult = await auth.api.signInEmail({
      body: {
        email: input.email.toLowerCase(),
        password: input.password,
      },
    });

    if (!signInResult || !signInResult.user) {
      const error = new Error('Invalid email or password credentials.') as Error & { statusCode?: number };
      error.statusCode = 401;
      throw error;
    }

    dbUser.lastLoginAt = new Date();
    await dbUser.save();

    // Audit Log Entry
    await AuditLogModel.create({
      userId: dbUser._id,
      userEmail: dbUser.email,
      userRole: dbUser.role,
      companyId: dbUser.companyId,
      action: AuditAction.LOGIN,
      entity: AuditEntity.USER,
      entityId: dbUser._id.toString(),
      details: { ip: ipAddress },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return {
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        companyId: dbUser.companyId?.toString(),
        departmentId: dbUser.departmentId?.toString(),
        avatarUrl: dbUser.avatarUrl,
        lastLoginAt: dbUser.lastLoginAt,
      },
      token: signInResult.token || null,
    };
  }

  /**
   * Sign Out / Invalidate current user session
   */
  static async logout(userId: string, userEmail: string, userRole: string, companyId?: string, ipAddress?: string, userAgent?: string) {
    try {
      await auth.api.signOut();
    } catch {
      // Ignore if session already destroyed
    }

    await AuditLogModel.create({
      userId,
      userEmail,
      userRole,
      companyId,
      action: AuditAction.LOGOUT,
      entity: AuditEntity.USER,
      entityId: userId,
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: 'Logged out successfully.' };
  }

  /**
   * Initiate Forgot Password Workflow
   */
  static async forgotPassword(input: ForgotPasswordInput) {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() });

    // Return generic success to prevent email enumeration attacks
    if (!user) {
      return {
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      };
    }

    try {
      const authApi = auth.api as unknown as { forgetPassword?: (args: { body: { email: string; redirectTo?: string } }) => Promise<unknown> };
      if (typeof authApi.forgetPassword === 'function') {
        await authApi.forgetPassword({
          body: {
            email: input.email.toLowerCase(),
            redirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password`,
          },
        });
      }
    } catch (err) {
      console.warn('Better Auth forgetPassword notice:', err);
    }

    return {
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  /**
   * Complete Password Reset using token
   */
  static async resetPassword(input: ResetPasswordInput) {
    try {
      await auth.api.resetPassword({
        body: {
          token: input.token,
          newPassword: input.newPassword,
        },
      });
      return { message: 'Password has been reset successfully. You may now log in.' };
    } catch {
      const error = new Error('Invalid or expired password reset token.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Change Password for Authenticated User
   */
  static async changePassword(userId: string, input: ChangePasswordInput, reqHeaders: Record<string, string>) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User account not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: true,
        },
        headers: reqHeaders,
      });
    } catch {
      const error = new Error('Failed to change password. Please verify your current password.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    return { message: 'Password changed successfully.' };
  }

  /**
   * Retrieve Current Authenticated User Profile
   */
  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId)
      .populate('companyId', 'name code industry logoUrl')
      .populate('departmentId', 'name code');

    if (!user) {
      const error = new Error('User profile not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      isMfaEnabled: user.isMfaEnabled,
      company: user.companyId,
      department: user.departmentId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update Profile Details for Authenticated User
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await UserModel.findById(userId);

    if (!user) {
      const error = new Error('User profile not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
    if (input.departmentId !== undefined) user.departmentId = input.departmentId as unknown as IUser['departmentId'];

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt,
    };
  }
}

export default AuthService;

import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer, jwt, admin } from 'better-auth/plugins';
import mongoose from 'mongoose';
import { env } from './env.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';

/**
 * Better Auth Server-Side Instance Configuration
 * Manages Authentication, Session Cookies, Bearer / JWT Tokens, Password Hashing, and Role-Based Access Control (RBAC).
 *
 * IMPORTANT: auth.ts is imported at module-load time. The mongodbAdapter() call
 * is wrapped in a lazy getter so mongoose.connection.getClient() is only accessed
 * AFTER connectDB() has completed (i.e., when auth.api methods are first invoked).
 */

import { MongoClient } from 'mongodb';

// Instantiate a separate client for Better Auth to prevent timing issues with Mongoose connection
const client = new MongoClient(env.MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  appName: 'ComplianceFlow',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // Use the official Better Auth MongoDB adapter
  database: mongodbAdapter(db, { client }),




  // Email and Password Credential Authentication Strategy
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },

  // State-of-the-Art Session Management Strategy
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Days Total Session Lifespan
    updateAge: 60 * 60 * 24, // 24 Hours Rolling Session Refresh Threshold
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 Minutes Local Cookie Cache
    },
    freshAge: 60 * 60, // 1 Hour Freshness Window for High-Security Operations
  },

  // Extended User Schema Fields for Multi-Tenant Role Based Access Control
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: UserRole.EMPLOYEE,
      },
      companyId: {
        type: 'string',
        required: false,
      },
      departmentId: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      phoneNumber: {
        type: 'string',
        required: false,
      },
      isMfaEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },

  // Modular Better Auth Security Plugins
  plugins: [
    // 1. Bearer Token Plugin - Extracts 'Authorization: Bearer <token>' for Mobile & REST API Clients
    bearer(),

    // 2. JWT Plugin - Issues signed JSON Web Tokens for stateless API Authorization
    jwt({
      jwt: {
        expirationTime: '7d',
      },
    }),

    // 3. Admin & RBAC Plugin - Provides Built-in Role Verification Infrastructure
    admin({
      defaultRole: UserRole.EMPLOYEE,
      adminRole: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    }),
  ],

  // Security, Cookie & Transmit Protocols
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    },
  },
});

export type AuthInstance = typeof auth;
export default auth;

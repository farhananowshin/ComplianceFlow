import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Pre-load environment variables before validation
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().default('http://localhost:3000'),

  // MongoDB Connection String
  MONGODB_URI: z
    .string()
    .default('mongodb://localhost:27017/complianceflow'),

  // Better Auth Credentials
  BETTER_AUTH_SECRET: z.string().default('complianceflow_default_dev_secret_key_12345'),
  BETTER_AUTH_URL: z.string().default('http://localhost:5000'),

  // Cloudinary Storage (Optional during initial dev setup)
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Nodemailer Email SMTP
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('ComplianceFlow Notifications <no-reply@complianceflow.com>'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment Variable Validation Errors:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration detected. Please fix the variables in .env');
  }

  return result.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;

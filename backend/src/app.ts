import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes.js';
import companyRoutes from './modules/company/company.routes.js';
import departmentRoutes from './modules/company/department.routes.js';
import userRoutes from './modules/user/user.routes.js';
import complianceRoutes from './modules/compliance/compliance.routes.js';
import renewalRoutes from './modules/renewal/renewal.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import qrRoutes from './modules/qr/qr.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import setupSwagger from './docs/swagger.js';

const app: Express = express();

// ==========================================
// 1. Core Security & Performance Middlewares
// ==========================================

// Helmet HTTP Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  })
);

// HTTP Request Compression
app.use(compression());

// HTTP Request Logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. Base & Health Check Routes
// ==========================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'ComplianceFlow API Service is healthy and operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to ComplianceFlow v1 RESTful API Infrastructure',
    version: '1.0.0',
    documentation: '/api/v1/docs',
  });
});

// Setup Swagger / OpenAPI Interactive Documentation UI
setupSwagger(app);

// ==========================================
// 3. Application API Modules
// ==========================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/documents', complianceRoutes);
app.use('/api/v1/renewals', renewalRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/verify', qrRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/verify', qrRoutes);

// ==========================================
// 4. 404 Unhandled Route Handler
// ==========================================

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found on ComplianceFlow backend server.`,
  });
});

// ==========================================
// 4. Centralized Global Error Handler
// ==========================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('💥 Centralized Error Handler Caught:', err);

  const statusCode = (err as unknown as { statusCode?: number }).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

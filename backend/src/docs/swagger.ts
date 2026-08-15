import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ComplianceFlow Enterprise API Infrastructure',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for multi-tenant Compliance, License Tracking, Renewal Workflows, QR Verification, Audit Logging, Calendar Scheduling, and Global Search.',
    contact: {
      name: 'ComplianceFlow Engineering Team',
      email: 'support@complianceflow.com',
      url: 'https://complianceflow.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production / Relative API v1 Endpoint',
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local Development Server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'System & Health', description: 'API Health Check & Base Verification Endpoints' },
    { name: 'Auth & Profile', description: 'User Authentication, JWT Token Management & User Profile' },
    { name: 'Companies', description: 'Multi-Tenant Company Entity Management & Branding Settings' },
    { name: 'Departments', description: 'Organizational Unit & Department Management' },
    { name: 'Users', description: 'User Account Provisioning, Role Assignments & Deactivation' },
    { name: 'Compliance Records', description: 'Document, License, Permit & Compliance Record Tracking' },
    { name: 'Renewals', description: 'Renewal Workflow Engine, Cost Approval & Multi-Level Approvals' },
    { name: 'Dashboard', description: 'Analytics, Compliance Health Metrics, Risk Alerts & Financial Forecasts' },
    { name: 'QR & Verification', description: 'Public QR Code Generation, Scanning & Instant Authenticity Verification' },
    { name: 'Calendar', description: 'Monthly Compliance Calendar, Expiry Schedules & Renewal Milestones' },
    { name: 'Search', description: 'Cross-Entity Multi-Tenant Global Search with Advanced Filters' },
    { name: 'Notifications', description: 'User In-App Alert Notifications & Expiry Reminders' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide valid JWT Access Token in standard `Authorization: Bearer <token>` header.',
      },
      tenantHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Tenant-ID',
        description: 'Optional Multi-Tenant Company ID header for tenant context switching.',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation completed successfully.' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-07-29T14:00:00.000Z' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Invalid input parameters or request payload.' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef123' },
          name: { type: 'string', example: 'Nusrat Jahan' },
          email: { type: 'string', format: 'email', example: 'nusrat.jahan@rahmantextiles.com.bd' },
          role: {
            type: 'string',
            enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
            example: 'MANAGER',
          },
          companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
          departmentId: { type: 'string', example: '66a5e1234567890abcdef200' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], example: 'ACTIVE' },
          phoneNumber: { type: 'string', example: '+880 1812-456789' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Company: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef100' },
          name: { type: 'string', example: 'Bengal Manufacturing Ltd.' },
          code: { type: 'string', example: 'BENGAL' },
          registrationNumber: { type: 'string', example: 'REG-BD-2014-89234' },
          taxId: { type: 'string', example: 'TIN-849302192' },
          contactEmail: { type: 'string', example: 'contact@bengalmanufacturing.com.bd' },
          industry: { type: 'string', example: 'Manufacturing & Industrial Solutions' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], example: 'ACTIVE' },
          logoUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/logo.png' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef200' },
          name: { type: 'string', example: 'Environmental Health & Safety' },
          code: { type: 'string', example: 'EHS' },
          companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
          managerId: { type: 'string', example: '66a5e1234567890abcdef123' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ComplianceRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef300' },
          documentName: { type: 'string', example: 'EPA Hazardous Material Facility Operating License' },
          licenseNumber: { type: 'string', example: 'EPA-HAZ-2026-9081' },
          category: {
            type: 'string',
            enum: ['ENVIRONMENTAL', 'HEALTH_SAFETY', 'DATA_PRIVACY', 'FINANCIAL', 'TAX', 'OPERATIONAL', 'LABOR', 'QUALITY', 'OTHER'],
            example: 'ENVIRONMENTAL',
          },
          issuingAuthority: { type: 'string', example: 'Environmental Protection Agency (EPA)' },
          issueDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
          expiryDate: { type: 'string', format: 'date-time', example: '2026-08-30T00:00:00.000Z' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING_RENEWAL', 'COMPLIANT', 'NON_COMPLIANT'],
            example: 'ACTIVE',
          },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          qrCodeId: { type: 'string', example: '3a18b9c2-7d12-40f8-9a21-812e9b01c102' },
          companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
          departmentId: { type: 'string', example: '66a5e1234567890abcdef200' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RenewalRecord: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef400' },
          renewalNumber: { type: 'string', example: 'REN-2026-0081' },
          complianceId: { type: 'string', example: '66a5e1234567890abcdef300' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
            example: 'SUBMITTED',
          },
          renewalCost: { type: 'number', example: 45000.0 },
          currency: { type: 'string', example: 'BDT' },
          newExpiryDate: { type: 'string', format: 'date-time', example: '2028-08-30T00:00:00.000Z' },
          notes: { type: 'string', example: 'Annual operating permit renewal submission with inspection report.' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a5e1234567890abcdef500' },
          title: { type: 'string', example: 'License Expiry Warning' },
          message: { type: 'string', example: 'Trade License TL-DNCC-2025-089421 will expire in 30 days.' },
          type: { type: 'string', enum: ['EXPIRY_WARNING', 'RENEWAL_REQUIRED', 'STATUS_CHANGE', 'SYSTEM_ALERT'], example: 'EXPIRY_WARNING' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System & Health'],
        summary: 'System Health Check',
        description: 'Verify operational status, environment configuration, and database connection of the backend service.',
        responses: {
          200: {
            description: 'API service is healthy and functional.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'ComplianceFlow API Service is healthy and operational',
                  timestamp: '2026-07-29T14:00:00.000Z',
                  environment: 'development',
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth & Profile'],
        summary: 'Register New User Account',
        description: 'Create a new user account with role assignment and optional multi-tenant company association.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Nusrat Jahan' },
                  email: { type: 'string', format: 'email', example: 'nusrat.jahan@rahmantextiles.com.bd' },
                  password: { type: 'string', format: 'password', example: 'SecurePassword123!' },
                  role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'], example: 'MANAGER' },
                  companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
                  departmentId: { type: 'string', example: '66a5e1234567890abcdef200' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User account created successfully.' },
          400: { description: 'Validation error or email already in use.' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth & Profile'],
        summary: 'Authenticate User & Issue Access Token',
        description: 'Login with email credentials and retrieve JWT bearer token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'nusrat.jahan@rahmantextiles.com.bd' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful. Returns user details and JWT access token.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  statusCode: 200,
                  message: 'User logged in successfully',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                      id: '66a5e1234567890abcdef123',
                      name: 'Nusrat Jahan',
                      email: 'nusrat.jahan@rahmantextiles.com.bd',
                      role: 'MANAGER',
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials.' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth & Profile'],
        summary: 'Get Current Authenticated User Details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated user profile retrieved.' },
          401: { description: 'Unauthorized.' },
        },
      },
    },
    '/auth/profile': {
      patch: {
        tags: ['Auth & Profile'],
        summary: 'Update Current User Profile Information',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Nusrat Jahan' },
                  phoneNumber: { type: 'string', example: '+880 1812-456789' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully.' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth & Profile'],
        summary: 'Change User Password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'SecurePassword123!' },
                  newPassword: { type: 'string', example: 'NewStrongPassword456!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated successfully.' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth & Profile'],
        summary: 'Request Password Reset Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', example: 'nusrat.jahan@rahmantextiles.com.bd' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset link sent.' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth & Profile'],
        summary: 'Reset Password with Reset Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', example: 'reset-token-xyz789' },
                  newPassword: { type: 'string', example: 'BrandNewPassword789!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful.' },
        },
      },
    },
    '/companies': {
      get: {
        tags: ['Companies'],
        summary: 'List & Paginate Companies',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term by name, code or industry' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'List of tenant companies retrieved.' },
        },
      },
      post: {
        tags: ['Companies'],
        summary: 'Create New Tenant Company',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code'],
                properties: {
                  name: { type: 'string', example: 'Eastern Pharmaceuticals Ltd.' },
                  code: { type: 'string', example: 'EASTERN' },
                  registrationNumber: { type: 'string', example: 'REG-BD-2018-991' },
                  taxId: { type: 'string', example: 'TIN-8829103' },
                  contactEmail: { type: 'string', example: 'info@easternpharma.com.bd' },
                  industry: { type: 'string', example: 'Pharmaceuticals & Healthcare' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Company created successfully.' },
        },
      },
    },
    '/companies/{id}': {
      get: {
        tags: ['Companies'],
        summary: 'Get Single Company Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Company details retrieved.' } },
      },
      patch: {
        tags: ['Companies'],
        summary: 'Update Company Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Eastern Pharmaceuticals International Ltd.' },
                  contactEmail: { type: 'string', example: 'support@easternpharma.com.bd' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Company updated.' } },
      },
    },
    '/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List & Search Departments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Departments list retrieved.' } },
      },
      post: {
        tags: ['Departments'],
        summary: 'Create Department',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code', 'companyId'],
                properties: {
                  name: { type: 'string', example: 'Quality Assurance & Compliance' },
                  code: { type: 'string', example: 'QAC' },
                  companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
                  description: { type: 'string', example: 'Department responsible for ISO compliance and audits.' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Department created.' } },
      },
    },
    '/compliance': {
      get: {
        tags: ['Compliance Records'],
        summary: 'List / Filter / Paginate Compliance Documents',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Compliance records retrieved.' } },
      },
      post: {
        tags: ['Compliance Records'],
        summary: 'Create New Compliance Document Record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['documentName', 'category', 'issuingAuthority', 'issueDate', 'expiryDate', 'companyId'],
                properties: {
                  documentName: { type: 'string', example: 'Environmental Facility Operating License' },
                  licenseNumber: { type: 'string', example: 'LIC-2026-EHS-009' },
                  category: { type: 'string', example: 'ENVIRONMENTAL' },
                  issuingAuthority: { type: 'string', example: 'Department of Natural Resources' },
                  issueDate: { type: 'string', format: 'date', example: '2024-01-01' },
                  expiryDate: { type: 'string', format: 'date', example: '2026-12-31' },
                  companyId: { type: 'string', example: '66a5e1234567890abcdef100' },
                  departmentId: { type: 'string', example: '66a5e1234567890abcdef200' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
                  file: { type: 'string', format: 'binary', description: 'PDF or Image supporting attachment file' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Compliance record created successfully.' } },
      },
    },
    '/compliance/{id}': {
      get: {
        tags: ['Compliance Records'],
        summary: 'Get Compliance Record Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Record details retrieved.' } },
      },
      patch: {
        tags: ['Compliance Records'],
        summary: 'Update Compliance Record',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  documentName: { type: 'string', example: 'Updated Facility Operating License' },
                  expiryDate: { type: 'string', format: 'date', example: '2027-12-31' },
                  priority: { type: 'string', example: 'CRITICAL' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Record updated.' } },
      },
      delete: {
        tags: ['Compliance Records'],
        summary: 'Soft Delete Compliance Record',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Record marked as deleted.' } },
      },
    },
    '/compliance/{id}/generate-qr': {
      post: {
        tags: ['Compliance Records', 'QR & Verification'],
        summary: 'Generate UUID & QR Code for Compliance Document',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'QR Code generated with public verification URL and base64 Data URL.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  statusCode: 200,
                  message: 'QR Code generated and saved successfully.',
                  data: {
                    complianceId: '66a5e1234567890abcdef300',
                    documentName: 'EPA Hazardous Material Facility Operating License',
                    licenseNumber: 'EPA-HAZ-2026-9081',
                    qrCodeId: '3a18b9c2-7d12-40f8-9a21-812e9b01c102',
                    verificationUrl: 'http://localhost:3000/verify/3a18b9c2-7d12-40f8-9a21-812e9b01c102',
                    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFA...',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/verify/{qr}': {
      get: {
        tags: ['QR & Verification'],
        summary: 'Public Compliance QR Verification Endpoint',
        description: 'No authentication required. Verifies document authenticity, expiry date, remaining days, and calculates real-time compliance health score.',
        parameters: [
          {
            name: 'qr',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'QR Code UUID string or Document ID',
            example: '3a18b9c2-7d12-40f8-9a21-812e9b01c102',
          },
        ],
        responses: {
          200: {
            description: 'Document verification successful.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  statusCode: 200,
                  message: 'Compliance QR code verified successfully.',
                  data: {
                    verified: true,
                    verifiedAt: '2026-07-29T14:00:00.000Z',
                    company: {
                      id: '66a5e1234567890abcdef100',
                      name: 'Bengal Manufacturing Ltd.',
                      code: 'BENGAL',
                      email: 'contact@bengalmanufacturing.com.bd',
                      industry: 'Manufacturing & Industrial Solutions',
                      status: 'ACTIVE',
                    },
                    document: {
                      id: '66a5e1234567890abcdef300',
                      documentName: 'EPA Hazardous Material Facility Operating License',
                      licenseNumber: 'EPA-HAZ-2026-9081',
                      category: 'ENVIRONMENTAL',
                      issuingAuthority: 'Environmental Protection Agency (EPA)',
                      issueDate: '2024-01-15T00:00:00.000Z',
                      expiryDate: '2026-08-30T00:00:00.000Z',
                      priority: 'HIGH',
                      qrCodeId: '3a18b9c2-7d12-40f8-9a21-812e9b01c102',
                    },
                    status: 'ACTIVE',
                    expiryDate: '2026-08-30T00:00:00.000Z',
                    remainingDays: 32,
                    complianceScore: 100,
                  },
                },
              },
            },
          },
          404: { description: 'Invalid or expired QR verification code.' },
        },
      },
    },
    '/renewals': {
      get: {
        tags: ['Renewals'],
        summary: 'List & Filter Renewal Requests',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'complianceId', in: 'query', schema: { type: 'string' } },
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Renewals list retrieved.' } },
      },
      post: {
        tags: ['Renewals'],
        summary: 'Submit Renewal Request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['complianceId', 'renewalCost'],
                properties: {
                  complianceId: { type: 'string', example: '66a5e1234567890abcdef300' },
                  renewalCost: { type: 'number', example: 45000.0 },
                  currency: { type: 'string', example: 'BDT' },
                  newExpiryDate: { type: 'string', format: 'date', example: '2028-08-30' },
                  notes: { type: 'string', example: 'Permit extension request submitted with statutory fee payment.' },
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Renewal request created.' } },
      },
    },
    '/renewals/{id}/status': {
      patch: {
        tags: ['Renewals'],
        summary: 'Approve, Reject or Transition Renewal Status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
                    example: 'APPROVED',
                  },
                  notes: { type: 'string', example: 'Approved by Compliance Director.' },
                  rejectionReason: { type: 'string', example: 'Missing required environmental audit document.' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Renewal status updated.' } },
      },
    },
    '/dashboard/overview': {
      get: {
        tags: ['Dashboard'],
        summary: 'Comprehensive Compliance Analytics & KPI Dashboard',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Overview data including metric cards, compliance score, risk distribution, financial forecast, and recent audit activity.',
          },
        },
      },
    },
    '/calendar': {
      get: {
        tags: ['Calendar'],
        summary: 'Get Monthly Compliance Calendar Events',
        description: 'Aggregates Expiry and Renewal Events using MongoDB Aggregation Pipeline for interactive calendar views.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'year', in: 'query', schema: { type: 'integer', example: 2026 } },
          { name: 'month', in: 'query', schema: { type: 'integer', example: 8 } },
          { name: 'eventType', in: 'query', schema: { type: 'string', enum: ['ALL', 'EXPIRY', 'RENEWAL'], default: 'ALL' } },
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Calendar events grouped chronologically and by date string.' },
        },
      },
    },
    '/calendar/upcoming': {
      get: {
        tags: ['Calendar'],
        summary: 'Get Upcoming Expiry & Renewal Events',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'companyId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Upcoming events retrieved.' } },
      },
    },
    '/calendar/summary': {
      get: {
        tags: ['Calendar'],
        summary: 'Get Calendar Monthly Summary Statistics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          { name: 'month', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Monthly summary statistics.' } },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Global Multi-Tenant Search Endpoint',
        description: 'Search across Compliance Records, Companies, Departments, Users, Renewals, and Notifications.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term', example: 'Environmental' },
          { name: 'entities', in: 'query', schema: { type: 'string' }, description: 'Comma-separated entities to search', example: 'compliance,company,renewal' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: { description: 'Global search results grouped by entity and flattened.' },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List User In-App Notifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'isRead', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: { 200: { description: 'Notifications list retrieved.' } },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get Unread Notifications Count',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Unread notifications count.' } },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark All Notifications as Read',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All notifications marked as read.' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark Single Notification as Read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Notification marked as read.' } },
      },
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete Single Notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Notification deleted.' } },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  // Serve Swagger UI
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve raw OpenAPI JSON specification
  app.get('/api/v1/docs/openapi.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;

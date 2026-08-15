import { Router, Request, Response } from 'express';
import { DbStore } from './db.js';

const router = Router();

// Helper to extract active user ID from Request headers/tokens
function extractUserId(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer mock_jwt_token_')) {
    return authHeader.replace('Bearer mock_jwt_token_', '').trim();
  }
  const xUserId = req.headers['x-user-id'] as string;
  if (xUserId) return xUserId.trim();
  return '';
}

function getRoleCategoryFromRole(role?: string): 'admin' | 'manager' | 'employee' {
  if (!role) return 'employee';
  const norm = role.toLowerCase().trim();
  if (norm.includes('super_admin') || norm.includes('company_admin') || norm === 'admin' || norm === 'global_admin') {
    return 'admin';
  }
  if (norm.includes('compliance_officer') || norm.includes('department_manager') || norm.includes('manager')) {
    return 'manager';
  }
  return 'employee';
}

function getActorUser(req: Request) {
  const userId = extractUserId(req);
  if (userId) {
    const u = DbStore.getUserById(userId);
    if (u) return u;
  }
  const users = DbStore.getUsers();
  return users.length > 0 ? users[0] : null;
}

function getActorFromRequest(req: Request) {
  const user = getActorUser(req);
  if (user) {
    return {
      userId: user.id,
      userName: user.name,
      userRole: user.role
    };
  }
  return {
    userId: 'usr_admin',
    userName: 'Adrita Chakraborty',
    userRole: 'company_admin'
  };
}

// =====================================
// 1. AUTHENTICATION & SESSION SIMULATION
// =====================================
router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = DbStore.getUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (foundUser) {
    DbStore.updateUser(foundUser.id, { lastLogin: new Date().toISOString() });
    DbStore.logAudit({
      userId: foundUser.id,
      userName: foundUser.name,
      userRole: foundUser.role,
      companyId: foundUser.companyId,
      action: 'USER_LOGIN',
      entityType: 'Auth',
      entityId: foundUser.id,
      details: `User ${foundUser.name} authenticated successfully.`,
      ipAddress: req.ip || '127.0.0.1',
      status: 'success'
    });
    return res.json({ success: true, user: foundUser, token: 'mock_jwt_token_' + foundUser.id });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password. Account not found.' });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const user = (userId ? DbStore.getUserById(userId) : null) || DbStore.getUsers()[0];
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated session.' });
  }

  return res.json({ success: true, user });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, companyName, role, phoneNumber, department } = req.body;
  if (!name || !email || !companyName) {
    return res.status(400).json({ success: false, message: 'Name, email, and company name are required.' });
  }

  const existing = DbStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
  }

  // Create new company for user or reuse existing matching company
  let company = DbStore.getCompanies().find(c => c.name.toLowerCase() === companyName.toLowerCase());
  if (!company) {
    company = DbStore.addCompany({
      name: companyName,
      registrationNumber: 'REG-' + Math.floor(100000 + Math.random() * 900000),
      taxId: 'TAX-' + Math.floor(100000 + Math.random() * 900000),
      industry: 'Enterprise Solutions',
      country: 'United States',
      status: 'active',
      contactEmail: email,
      contactPhone: phoneNumber || '+1 555-019-2830',
      address: 'Corporate Headquarters'
    });
  }

  const newUser = DbStore.addUser({
    name,
    email,
    role: role || 'company_admin',
    companyId: company.id,
    companyName: company.name,
    department: department || '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  DbStore.logAudit({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    companyId: company.id,
    action: 'USER_REGISTERED',
    entityType: 'Auth',
    entityId: newUser.id,
    details: `New organization account registered for ${company.name} by ${newUser.name}.`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'success'
  });

  return res.status(201).json({
    success: true,
    user: newUser,
    token: 'mock_jwt_token_' + newUser.id,
    message: 'Registration successful!'
  });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const user = DbStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || DbStore.getUsers()[0];
  const resetToken = 'RST-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  DbStore.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    companyId: user.companyId,
    action: 'PASSWORD_RESET_REQUESTED',
    entityType: 'Auth',
    entityId: user.id,
    details: `Password reset requested for ${user.email}. Token generated: ${resetToken}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'success'
  });

  return res.json({
    success: true,
    message: 'Reset instructions sent to your email.',
    resetToken
  });
});

router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  const users = DbStore.getUsers();
  const user = users[0]; // Apply to active user session

  DbStore.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    companyId: user.companyId,
    action: 'PASSWORD_RESET_COMPLETED',
    entityType: 'Auth',
    entityId: user.id,
    details: `Password updated successfully via reset token ${token}`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'success'
  });

  return res.json({
    success: true,
    message: 'Password reset successfully. You can now log in.'
  });
});

router.put('/auth/profile', (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthenticated session.' });
  }

  const { name, department, avatar, phoneNumber } = req.body;

  const updated = DbStore.updateUser(userId, {
    ...(name && { name }),
    ...(department && { department }),
    ...(avatar && { avatar })
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }

  DbStore.logAudit({
    userId: updated.id,
    userName: updated.name,
    userRole: updated.role,
    companyId: updated.companyId,
    action: 'PROFILE_UPDATED',
    entityType: 'Auth',
    entityId: updated.id,
    details: `User profile updated for ${updated.name}.`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'success'
  });

  return res.json({ success: true, user: updated, message: 'Profile updated successfully!' });
});

router.post('/auth/change-password', (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthenticated session.' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  const user = DbStore.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }

  DbStore.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    companyId: user.companyId,
    action: 'PASSWORD_CHANGED',
    entityType: 'Auth',
    entityId: user.id,
    details: `User ${user.name} changed their password from user profile security tab.`,
    ipAddress: req.ip || '127.0.0.1',
    status: 'success'
  });

  return res.json({ success: true, message: 'Password changed successfully!' });
});

// =====================================
// 2. DASHBOARD METRICS & HEALTH
// =====================================
router.get('/dashboard/metrics', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const metrics = DbStore.getDashboardMetrics(companyId);
  return res.json({ success: true, metrics });
});

router.get('/dashboard/overview', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const overviewData = DbStore.getDashboardOverview(companyId);
  return res.json({
    success: true,
    status: 'success',
    statusCode: 200,
    message: 'Dashboard analytics fetched successfully',
    data: overviewData
  });
});

router.get('/dashboard/charts', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const chartsData = DbStore.getDashboardCharts(companyId);
  return res.json({
    success: true,
    status: 'success',
    statusCode: 200,
    message: 'Dashboard chart analytics fetched successfully',
    data: chartsData
  });
});
// =====================================
// 3. COMPANY MANAGEMENT
// =====================================
router.get('/companies', (req: Request, res: Response) => {
  const companies = DbStore.getCompanies();
  return res.json({ success: true, companies });
});

router.get('/companies/:id', (req: Request, res: Response) => {
  const company = DbStore.getCompanyById(req.params.id);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
  return res.json({ success: true, company });
});

router.post('/companies', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can create companies.' });
  }

  const { name, registrationNumber, taxId, industry, country, contactEmail, contactPhone, address } = req.body;
  if (!name || !registrationNumber) {
    return res.status(400).json({ success: false, message: 'Name and Registration Number are required' });
  }

  const newCompany = DbStore.addCompany({
    name,
    registrationNumber,
    taxId: taxId || 'TAX-' + Math.floor(100000 + Math.random() * 900000),
    industry: industry || 'Enterprise',
    country: country || 'United States',
    status: 'active',
    contactEmail: contactEmail || 'info@company.com',
    contactPhone: contactPhone || '+1 555-000-0000',
    address: address || 'Corporate Plaza, NY'
  });

  return res.status(201).json({ success: true, company: newCompany });
});

router.put('/companies/:id', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can update company details.' });
  }

  const updated = DbStore.updateCompany(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Company not found' });
  return res.json({ success: true, company: updated });
});

// =====================================
// 3.5 DEPARTMENT MANAGEMENT
// =====================================
router.get('/departments', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const allDepts = DbStore.getDepartments({ companyId, search, status });
  const total = allDepts.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedDepts = allDepts.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    data: paginatedDepts,
    departments: paginatedDepts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get('/departments/:id', (req: Request, res: Response) => {
  const dept = DbStore.getDepartmentById(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, data: dept, department: dept });
});

router.post('/departments', (req: Request, res: Response) => {
  const { name, code, companyId, description, managerId, status } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Department name and code are required' });
  }

  const newDept = DbStore.addDepartment({
    name,
    code,
    companyId,
    description,
    managerId,
    status
  });

  return res.status(201).json({ success: true, data: newDept, department: newDept });
});

router.put('/departments/:id', (req: Request, res: Response) => {
  const updated = DbStore.updateDepartment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, data: updated, department: updated });
});

router.patch('/departments/:id', (req: Request, res: Response) => {
  const updated = DbStore.updateDepartment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, data: updated, department: updated });
});

router.patch('/departments/:id/manager', (req: Request, res: Response) => {
  const { managerId } = req.body;
  const updated = DbStore.updateDepartment(req.params.id, { managerId });
  if (!updated) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, data: updated, department: updated });
});

router.patch('/departments/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Valid status (ACTIVE or INACTIVE) is required' });
  }
  const updated = DbStore.updateDepartment(req.params.id, { status });
  if (!updated) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, data: updated, department: updated });
});

router.delete('/departments/:id', (req: Request, res: Response) => {
  const deleted = DbStore.deleteDepartment(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Department not found' });
  return res.json({ success: true, message: 'Department deleted successfully' });
});

// =====================================
// 4. USER MANAGEMENT
// =====================================
router.get('/users', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const department = req.query.department as string;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as 'name' | 'createdAt' | 'lastLogin';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const filteredUsers = DbStore.getUsers({
    companyId,
    department,
    role,
    status,
    search,
    sortBy,
    sortOrder,
  });

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    data: paginatedUsers,
    users: paginatedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get('/users/:id', (req: Request, res: Response) => {
  const user = DbStore.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: user, user });
});

router.post('/users', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can create new user accounts.' });
  }

  const { name, email, phone, role, companyId, department, avatar, status } = req.body;
  if (!name || !email || !role || !companyId) {
    return res.status(400).json({ success: false, message: 'Name, email, role, and company are required' });
  }

  const company = DbStore.getCompanyById(companyId);
  const newUser = DbStore.addUser({
    name,
    email,
    phone: phone || '',
    role,
    companyId,
    companyName: company ? company.name : 'Enterprise Entity',
    department: department || 'General Operations',
    avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    status: status || 'active',
  });

  return res.status(201).json({ success: true, data: newUser, user: newUser });
});

router.put('/users/:id', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can modify user details.' });
  }

  const updated = DbStore.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated });
});

router.patch('/users/:id', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can modify user details.' });
  }

  const updated = DbStore.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated });
});

router.patch('/users/:id/company', (req: Request, res: Response) => {
  const { companyId } = req.body;
  if (!companyId) {
    return res.status(400).json({ success: false, message: 'Company ID is required' });
  }
  const updated = DbStore.updateUser(req.params.id, { companyId });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated });
});

router.patch('/users/:id/department', (req: Request, res: Response) => {
  const { department } = req.body;
  if (!department) {
    return res.status(400).json({ success: false, message: 'Department is required' });
  }
  const updated = DbStore.updateUser(req.params.id, { department });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated });
});

router.patch('/users/:id/role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ success: false, message: 'Role is required' });
  }
  const updated = DbStore.updateUser(req.params.id, { role });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated });
});

router.patch('/users/:id/deactivate', (req: Request, res: Response) => {
  const updated = DbStore.updateUser(req.params.id, { status: 'inactive' });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated, message: 'User deactivated successfully' });
});

router.patch('/users/:id/reactivate', (req: Request, res: Response) => {
  const updated = DbStore.updateUser(req.params.id, { status: 'active' });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: updated, user: updated, message: 'User reactivated successfully' });
});

router.post('/users/:id/reset-password', (req: Request, res: Response) => {
  const user = DbStore.getUserById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  const actor = getActorFromRequest(req);

  DbStore.logAudit({
    userId: actor.userId,
    userName: actor.userName,
    userRole: actor.userRole,
    companyId: user.companyId,
    action: 'RESET_PASSWORD',
    entityType: 'User',
    entityId: user.id,
    details: `Triggered password reset notification for ${user.email}.`,
    ipAddress: '127.0.0.1',
    status: 'success'
  });

  return res.json({
    success: true,
    message: `Password reset link sent successfully to ${user.email}`,
  });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const actor = getActorUser(req);
  if (actor && getRoleCategoryFromRole(actor.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can delete user accounts.' });
  }

  const deleted = DbStore.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'User deleted successfully' });
});

// =====================================
// 5. COMPLIANCE RECORDS & RENEWALS
// =====================================
router.get('/compliance-records', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const department = req.query.department as string;
  const category = req.query.category as string;
  const priority = (req.query.priority || req.query.riskLevel) as string;
  const status = req.query.status as string;
  const autoRenewal = req.query.autoRenewal as string;
  const expiringSoon = req.query.expiringSoon as string;
  const expired = req.query.expired as string;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as string;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  let list = DbStore.getRecords(companyId);

  // Data-level authorization scoping for Employees
  const actorUser = getActorUser(req);
  const actorCategory = actorUser ? getRoleCategoryFromRole(actorUser.role) : 'employee';
  if (actorCategory === 'employee' && actorUser) {
    list = list.filter(r =>
      (r.assignedUserId && r.assignedUserId === actorUser.id) ||
      (r.assignedUserName && r.assignedUserName.toLowerCase().includes(actorUser.name.toLowerCase())) ||
      (r.department && actorUser.department && r.department.toLowerCase() === actorUser.department.toLowerCase())
    );
  }

  // Department filter
  if (department && department !== 'all' && department !== 'ALL') {
    list = list.filter(r => r.department && r.department.toLowerCase() === department.toLowerCase());
  }

  // Category filter
  if (category && category !== 'all' && category !== 'ALL') {
    list = list.filter(r => r.category && r.category.toLowerCase() === category.toLowerCase());
  }

  // Priority / Risk level filter
  if (priority && priority !== 'all' && priority !== 'ALL') {
    list = list.filter(r =>
      (r.riskLevel && r.riskLevel.toLowerCase() === priority.toLowerCase()) ||
      (r.priority && r.priority.toLowerCase() === priority.toLowerCase())
    );
  }

  // Status filter
  if (status && status !== 'all' && status !== 'ALL') {
    list = list.filter(r => r.status && r.status.toLowerCase() === status.toLowerCase());
  }

  // Auto renewal filter
  if (autoRenewal !== undefined && autoRenewal !== '' && autoRenewal !== 'all') {
    const isAuto = autoRenewal === 'true' || autoRenewal === 'yes';
    list = list.filter(r => Boolean(r.autoRenewal) === isAuto);
  }

  // Expiring soon (within 30 days and not expired)
  const nowTime = new Date().getTime();
  if (expiringSoon === 'true') {
    list = list.filter(r => {
      const days = Math.ceil((new Date(r.expiryDate).getTime() - nowTime) / (1000 * 3600 * 24));
      return days >= 0 && days <= 30;
    });
  }

  // Expired
  if (expired === 'true') {
    list = list.filter(r => {
      const days = Math.ceil((new Date(r.expiryDate).getTime() - nowTime) / (1000 * 3600 * 24));
      return days < 0;
    });
  }

  // Search filter across Document Name, License Number, Category, Issuing Authority, Company, Department, Responsible Person
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.issuingAuthority && r.issuingAuthority.toLowerCase().includes(q)) ||
      (r.companyName && r.companyName.toLowerCase().includes(q)) ||
      (r.department && r.department.toLowerCase().includes(q)) ||
      (r.assignedUserName && r.assignedUserName.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy) {
    const order = sortOrder === 'desc' ? -1 : 1;
    list = [...list].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortBy === 'title' || sortBy === 'documentName') {
        valA = (a.title || a.documentName || '').toLowerCase();
        valB = (b.title || b.documentName || '').toLowerCase();
      } else if (sortBy === 'issueDate') {
        valA = a.issueDate || '';
        valB = b.issueDate || '';
      } else if (sortBy === 'expiryDate') {
        valA = a.expiryDate || '';
        valB = b.expiryDate || '';
      } else if (sortBy === 'daysRemaining') {
        valA = Math.ceil((new Date(a.expiryDate).getTime() - nowTime) / (1000 * 3600 * 24));
        valB = Math.ceil((new Date(b.expiryDate).getTime() - nowTime) / (1000 * 3600 * 24));
      } else if (sortBy === 'createdAt') {
        valA = a.createdAt || a.id;
        valB = b.createdAt || b.id;
      } else {
        valA = (a as any)[sortBy] || '';
        valB = (b as any)[sortBy] || '';
      }

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  }

  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedRecords = list.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    data: paginatedRecords,
    records: paginatedRecords,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get('/compliance-records/:id', (req: Request, res: Response) => {
  const record = DbStore.getRecordById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Compliance record not found' });
  return res.json({ success: true, data: record, record });
});

router.get('/compliance-records/:id/history', (req: Request, res: Response) => {
  const record = DbStore.getRecordById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Compliance record not found' });

  const allLogs = DbStore.getAuditLogs();
  const history = allLogs.filter(
    a => a.entityType === 'ComplianceRecord' && a.entityId === req.params.id
  );

  return res.json({ success: true, history, auditLogs: history });
});

router.post('/compliance-records', (req: Request, res: Response) => {
  const actorUser = getActorUser(req);
  if (actorUser && getRoleCategoryFromRole(actorUser.role) === 'employee') {
    return res.status(403).json({ success: false, message: 'Forbidden: Employees cannot create compliance records.' });
  }

  const {
    title, documentName, code, licenseNumber, companyId, department, category, issuingAuthority, issueDate, expiryDate,
    renewalFrequencyDays, renewalFrequency, riskLevel, priority, estimatedCost, assignedUserId, notes, tags, autoRenewal,
    documentUrl, supportingAttachmentUrl
  } = req.body;

  const docTitle = documentName || title;
  const docCode = licenseNumber || code;

  if (!docTitle || !docCode || !companyId || !expiryDate) {
    return res.status(400).json({ success: false, message: 'Document name, license number, company, and expiry date are required' });
  }

  const company = DbStore.getCompanyById(companyId);
  const user = DbStore.getUserById(assignedUserId) || DbStore.getUsers()[0];

  const actor = getActorFromRequest(req);

  const nowStr = new Date().toISOString();

  const newRecord = DbStore.addRecord({
    title: docTitle,
    code: docCode,
    companyId,
    companyName: company ? company.name : 'Enterprise Entity',
    department: department || 'General Operations',
    category: category || 'Corporate & Legal',
    issuingAuthority: issuingAuthority || 'Government Authority',
    issueDate: issueDate || new Date().toISOString().split('T')[0],
    expiryDate,
    renewalFrequencyDays: Number(renewalFrequencyDays || renewalFrequency) || 365,
    riskLevel: (riskLevel || priority || 'medium').toLowerCase() as any,
    priority: (priority || riskLevel || 'medium').toLowerCase() as any,
    estimatedCost: Number(estimatedCost) || 5000,
    assignedUserId: user.id,
    assignedUserName: user.name,
    notes: notes || '',
    autoRenewal: Boolean(autoRenewal),
    documentUrl: documentUrl || supportingAttachmentUrl || '',
    documentName: documentName || (documentUrl ? 'attachment.pdf' : ''),
    tags: Array.isArray(tags) ? tags : ['Compliance'],
    createdAt: nowStr,
    updatedAt: nowStr,
  }, actor);

  return res.status(201).json({ success: true, data: newRecord, record: newRecord });
});

router.put('/compliance-records/:id', (req: Request, res: Response) => {
  const actor = getActorFromRequest(req);

  const payload = { ...req.body, updatedAt: new Date().toISOString() };
  if (payload.documentName || payload.title) {
    payload.title = payload.documentName || payload.title;
  }
  if (payload.licenseNumber || payload.code) {
    payload.code = payload.licenseNumber || payload.code;
  }

  const updated = DbStore.updateRecord(req.params.id, payload, actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Compliance record not found' });
  return res.json({ success: true, data: updated, record: updated });
});

router.post('/compliance-records/:id/attachment', (req: Request, res: Response) => {
  const { documentUrl, documentName } = req.body;
  if (!documentUrl) {
    return res.status(400).json({ success: false, message: 'Document URL is required for attachment.' });
  }

  const actor = getActorFromRequest(req);

  const updated = DbStore.updateRecord(
    req.params.id,
    { documentUrl, documentName: documentName || 'compliance_attachment.pdf', updatedAt: new Date().toISOString() },
    actor
  );

  if (!updated) return res.status(404).json({ success: false, message: 'Compliance record not found' });

  DbStore.logAudit({
    userId: actor.userId,
    userName: actor.userName,
    userRole: actor.userRole,
    companyId: updated.companyId,
    action: 'ATTACHMENT_UPLOADED',
    entityType: 'ComplianceRecord',
    entityId: updated.id,
    details: `Uploaded attachment '${documentName || 'attachment.pdf'}' for compliance record '${updated.title}'.`,
    ipAddress: '127.0.0.1',
    status: 'success'
  });

  return res.json({ success: true, data: updated, record: updated, message: 'Attachment uploaded successfully' });
});

router.delete('/compliance-records/:id/attachment', (req: Request, res: Response) => {
  const actor = getActorFromRequest(req);

  const updated = DbStore.updateRecord(
    req.params.id,
    { documentUrl: '', documentName: '', updatedAt: new Date().toISOString() },
    actor
  );

  if (!updated) return res.status(404).json({ success: false, message: 'Compliance record not found' });

  DbStore.logAudit({
    userId: actor.userId,
    userName: actor.userName,
    userRole: actor.userRole,
    companyId: updated.companyId,
    action: 'ATTACHMENT_REMOVED',
    entityType: 'ComplianceRecord',
    entityId: updated.id,
    details: `Removed attachment for compliance record '${updated.title}'.`,
    ipAddress: '127.0.0.1',
    status: 'warning'
  });

  return res.json({ success: true, data: updated, record: updated, message: 'Attachment removed successfully' });
});

router.delete('/compliance-records/:id', (req: Request, res: Response) => {
  const actorUser = getActorUser(req);
  if (actorUser && getRoleCategoryFromRole(actorUser.role) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Only Administrators can delete compliance records.' });
  }

  const actor = getActorFromRequest(req);

  const deleted = DbStore.deleteRecord(req.params.id, actor);
  if (!deleted) return res.status(404).json({ success: false, message: 'Compliance record not found' });
  return res.json({ success: true, message: 'Record deleted successfully' });
});

// Advance Renewal Stage
router.post('/compliance-records/:id/advance-renewal', (req: Request, res: Response) => {
  const { step, notes } = req.body;
  const actor = getActorFromRequest(req);

  const updated = DbStore.advanceRenewalWorkflow(req.params.id, step, notes, actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
  return res.json({ success: true, record: updated });
});

// Public QR Code Verification endpoint
router.get('/qr/verify/:token', (req: Request, res: Response) => {
  const tokenStr = req.params.token;
  const record = DbStore.getRecordByQrToken(tokenStr);
  if (!record) {
    return res.status(404).json({
      success: false,
      verified: false,
      message: 'Invalid, unrecognized, or revoked compliance QR verification token.'
    });
  }

  const company = DbStore.getCompanyById(record.companyId);
  const isCompliant = record.status === 'compliant' || record.status === 'renewal_in_progress';
  
  const now = new Date();
  const exp = new Date(record.expiryDate);
  const daysUntilExpiry = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));

  return res.json({
    success: true,
    verified: true,
    verificationId: 'VER-' + record.id.toUpperCase() + '-' + Date.now().toString(36).toUpperCase(),
    verifiedAt: new Date().toISOString(),
    record: {
      id: record.id,
      title: record.title,
      code: record.code,
      companyId: record.companyId,
      companyName: record.companyName,
      department: record.department || 'Corporate Operations',
      category: record.category,
      issuingAuthority: record.issuingAuthority,
      issueDate: record.issueDate,
      expiryDate: record.expiryDate,
      status: record.status,
      riskLevel: record.riskLevel || 'medium',
      autoRenewal: record.autoRenewal || false,
      isCompliant,
      daysUntilExpiry,
      documentUrl: record.documentUrl || '',
      documentName: record.documentName || '',
      lastRenewedDate: record.lastRenewedDate,
      qrToken: record.qrToken
    },
    company: company ? {
      id: company.id,
      name: company.name,
      registrationNumber: company.registrationNumber,
      taxId: company.taxId,
      country: company.country,
      industry: company.industry,
      complianceScore: company.complianceScore,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address
    } : {
      id: record.companyId,
      name: record.companyName,
      registrationNumber: 'REG-2025-GLOBAL',
      taxId: 'TAX-APX-88201',
      country: 'United States',
      industry: 'Enterprise Solutions',
      complianceScore: 94,
      contactEmail: 'compliance@company.com',
      contactPhone: '+1 555-019-2830',
      address: 'Corporate Headquarters'
    }
  });
});

// =====================================
// 6. NOTIFICATIONS & EMAIL REMINDERS
// =====================================
router.get('/notifications/metrics', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const metrics = DbStore.getNotificationMetrics(companyId);
  return res.json({ success: true, metrics, data: metrics });
});

router.get('/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const type = req.query.type as string;
  const companyId = req.query.companyId as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const sortBy = req.query.sortBy as string;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const list = DbStore.getNotificationsFiltered({
    userId,
    search,
    status,
    priority,
    type,
    companyId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedNotifications = list.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    notifications: paginatedNotifications,
    data: paginatedNotifications,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get('/notifications/:id', (req: Request, res: Response) => {
  const notif = DbStore.getNotificationById(req.params.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  return res.json({ success: true, notification: notif, data: notif });
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const updated = DbStore.markNotificationRead(req.params.id);
  if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
  return res.json({ success: true, notification: updated, data: updated, message: 'Notification marked as read.' });
});

router.put('/notifications/:id/unread', (req: Request, res: Response) => {
  const updated = DbStore.markNotificationUnread(req.params.id);
  if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
  return res.json({ success: true, notification: updated, data: updated, message: 'Notification marked as unread.' });
});

router.post('/notifications/mark-all-read', (req: Request, res: Response) => {
  const userId = req.body.userId || req.headers['x-user-id'] as string;
  const count = DbStore.markAllNotificationsRead(userId);
  return res.json({ success: true, count, message: `Marked ${count} notifications as read.` });
});

router.post('/notifications/bulk-read', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of notification IDs is required.' });
  }
  const count = DbStore.bulkMarkNotificationsRead(ids);
  return res.json({ success: true, count, message: `Marked ${count} notifications as read.` });
});

router.post('/notifications/bulk-delete', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of notification IDs is required.' });
  }
  const count = DbStore.bulkDeleteNotifications(ids);
  return res.json({ success: true, count, message: `Deleted ${count} notifications.` });
});

router.delete('/notifications/:id', (req: Request, res: Response) => {
  const success = DbStore.deleteNotification(req.params.id);
  if (!success) return res.status(404).json({ success: false, message: 'Notification not found' });
  return res.json({ success: true, message: 'Notification deleted successfully.' });
});

router.post('/reminders/trigger-email', (req: Request, res: Response) => {
  const { recordId, recipientEmail } = req.body;
  const record = DbStore.getRecordById(recordId);

  if (!record) {
    return res.status(404).json({ success: false, message: 'Compliance record not found' });
  }

  const emailSubject = `URGENT REMINDER: Compliance Renewal Due for ${record.title}`;
  const emailContent = `Dear Compliance Officer,

This is an automated reminder from ComplianceFlow Enterprise System.

Compliance Title: ${record.title}
Code: ${record.code}
Company: ${record.companyName}
Issuing Authority: ${record.issuingAuthority}
Expiration Date: ${record.expiryDate}
Current Status: ${record.status.toUpperCase()}

Please log into your ComplianceFlow portal to initiate the renewal workflow immediately.`;

  // Log in Audit Trail
  DbStore.logAudit({
    userId: 'usr_compliance',
    userName: 'Automated Cron / Reminders',
    userRole: 'system',
    companyId: record.companyId,
    action: 'EMAIL_REMINDER_SENT',
    entityType: 'Notification',
    entityId: record.id,
    details: `Dispatched compliance renewal email alert to ${recipientEmail || record.assignedUserName} for ${record.title}.`,
    ipAddress: '127.0.0.1',
    status: 'success'
  });

  return res.json({
    success: true,
    message: `Compliance renewal alert email dispatched to ${recipientEmail || 'assigned officer'}.`,
    preview: {
      to: recipientEmail || 'compliance@apexglobal.tech',
      subject: emailSubject,
      body: emailContent
    }
  });
});

// =====================================
// 7. AUDIT LOGS & SYSTEM AUDIT METRICS
// =====================================
router.get('/audit-logs/metrics', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const metrics = DbStore.getAuditMetrics(companyId);
  return res.json({ success: true, metrics, data: metrics });
});

router.get('/audit-logs', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const userId = req.query.userId as string;
  const action = req.query.action as string;
  const entityType = req.query.entityType as string;
  const severity = (req.query.severity || req.query.status) as string;
  const search = req.query.search as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const logs = DbStore.getAuditLogsFiltered({
    companyId,
    userId,
    action,
    entityType,
    severity,
    search,
    startDate,
    endDate
  });

  const total = logs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedLogs = logs.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    auditLogs: paginatedLogs,
    data: paginatedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// =====================================
// 7.5 GLOBAL ENTERPRISE SEARCH
// =====================================
router.get('/search', (req: Request, res: Response) => {
  const query = (req.query.query || req.query.q || '') as string;
  const category = (req.query.category || 'all') as string;
  const companyId = req.query.companyId as string;

  const result = DbStore.globalSearch({
    query,
    category,
    companyId
  });

  return res.json({
    success: true,
    data: result,
    ...result
  });
});

// =====================================
// 8. RENEWAL MANAGEMENT
// =====================================
router.get('/renewals/metrics', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const metrics = DbStore.getRenewalMetrics(companyId);
  return res.json({ success: true, metrics, data: metrics });
});

router.get('/renewals', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const department = req.query.department as string;
  const status = req.query.status as string;
  const assignedReviewerId = (req.query.assignedReviewerId || req.query.assignedReviewer) as string;
  const search = req.query.search as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const sortBy = req.query.sortBy as any;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const list = DbStore.getRenewals({
    companyId,
    department,
    status,
    assignedReviewerId,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedRenewals = list.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    data: paginatedRenewals,
    renewals: paginatedRenewals,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

router.get('/renewals/:id', (req: Request, res: Response) => {
  const renewal = DbStore.getRenewalById(req.params.id);
  if (!renewal) return res.status(404).json({ success: false, message: 'Renewal request not found' });
  return res.json({ success: true, data: renewal, renewal });
});

router.get('/renewals/:id/history', (req: Request, res: Response) => {
  const renewal = DbStore.getRenewalById(req.params.id);
  if (!renewal) return res.status(404).json({ success: false, message: 'Renewal request not found' });

  const allLogs = DbStore.getAuditLogs();
  const auditLogs = allLogs.filter(
    a => a.entityType === 'Renewal' && a.entityId === req.params.id
  );

  return res.json({
    success: true,
    history: renewal.statusHistory || [],
    statusHistory: renewal.statusHistory || [],
    auditLogs
  });
});

router.post('/renewals', (req: Request, res: Response) => {
  const { complianceRecordId, assignedReviewerId, renewalCost, currency, newIssueDate, newExpiryDate, licenseNumber, notes, documentUrl, documentName } = req.body;

  if (!complianceRecordId || !assignedReviewerId || !newExpiryDate) {
    return res.status(400).json({ success: false, message: 'Compliance record, assigned reviewer, and new expiry date are required.' });
  }

  const actor = {
    userId: req.headers['x-user-id'] as string || 'usr_compliance',
    userName: req.headers['x-user-name'] as string || 'Md. Arif Hossain',
    userRole: req.headers['x-user-role'] as string || 'compliance_officer'
  };

  const newRenewal = DbStore.addRenewal(req.body, actor);

  return res.status(201).json({ success: true, data: newRenewal, renewal: newRenewal, message: 'Renewal request created successfully.' });
});

router.put('/renewals/:id', (req: Request, res: Response) => {
  const actor = {
    userId: req.headers['x-user-id'] as string || 'usr_compliance',
    userName: req.headers['x-user-name'] as string || 'Md. Arif Hossain',
    userRole: req.headers['x-user-role'] as string || 'compliance_officer'
  };

  const updated = DbStore.updateRenewal(req.params.id, req.body, actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Renewal request not found' });
  return res.json({ success: true, data: updated, renewal: updated, message: 'Renewal request updated successfully.' });
});

router.patch('/renewals/:id/status', (req: Request, res: Response) => {
  const { status, notes } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'New status is required.' });
  }

  const actor = {
    userId: req.headers['x-user-id'] as string || 'usr_compliance',
    userName: req.headers['x-user-name'] as string || 'Md. Arif Hossain',
    userRole: req.headers['x-user-role'] as string || 'compliance_officer'
  };

  const updated = DbStore.transitionRenewalStatus(req.params.id, status, notes || '', actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Renewal request not found' });

  return res.json({ success: true, data: updated, renewal: updated, message: `Status updated to ${status}.` });
});

router.post('/renewals/:id/attachment', (req: Request, res: Response) => {
  const { documentUrl, documentName } = req.body;
  if (!documentUrl) {
    return res.status(400).json({ success: false, message: 'Document URL is required.' });
  }

  const actor = {
    userId: req.headers['x-user-id'] as string || 'usr_compliance',
    userName: req.headers['x-user-name'] as string || 'Md. Arif Hossain',
    userRole: req.headers['x-user-role'] as string || 'compliance_officer'
  };

  const updated = DbStore.uploadRenewalAttachment(req.params.id, documentUrl, documentName, actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Renewal request not found' });

  return res.json({ success: true, data: updated, renewal: updated, message: 'Attachment uploaded successfully.' });
});

router.delete('/renewals/:id/attachment', (req: Request, res: Response) => {
  const actor = {
    userId: req.headers['x-user-id'] as string || 'usr_compliance',
    userName: req.headers['x-user-name'] as string || 'Md. Arif Hossain',
    userRole: req.headers['x-user-role'] as string || 'compliance_officer'
  };

  const updated = DbStore.deleteRenewalAttachment(req.params.id, actor);
  if (!updated) return res.status(404).json({ success: false, message: 'Renewal request not found' });

  return res.json({ success: true, data: updated, renewal: updated, message: 'Attachment removed successfully.' });
});

router.delete('/renewals/:id', (req: Request, res: Response) => {
  const actor = getActorFromRequest(req);

  const deleted = DbStore.deleteRenewal(req.params.id, actor);
  if (!deleted) return res.status(404).json({ success: false, message: 'Renewal request not found' });

  return res.json({ success: true, message: 'Renewal request deleted successfully.' });
});

// =====================================
// 9. CALENDAR MANAGEMENT
// =====================================
router.get('/calendar/summary', (req: Request, res: Response) => {
  const companyId = req.query.companyId as string;
  const summary = DbStore.getCalendarSummary(companyId);
  return res.json({ success: true, summary, data: summary });
});

router.get('/calendar/events', (req: Request, res: Response) => {
  const search = req.query.search as string;
  const companyId = req.query.companyId as string;
  const department = req.query.department as string;
  const status = req.query.status as string;
  const category = req.query.category as string;
  const priority = req.query.priority as string;
  const source = req.query.source as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const events = DbStore.getCalendarEvents({
    search,
    companyId,
    department,
    status,
    category,
    priority,
    source,
    startDate,
    endDate,
  });

  return res.json({
    success: true,
    events,
    data: events,
    total: events.length,
  });
});

export default router;

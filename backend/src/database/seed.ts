import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import auth from '../config/auth.js';
import UserModel from '../modules/user/user.model.js';
import CompanyModel from '../modules/company/company.model.js';
import DepartmentModel from '../modules/company/department.model.js';
import ComplianceRecordModel from '../modules/compliance/compliance.model.js';
import AuditLogModel from '../modules/audit/audit.model.js';
import {
  CompanyStatus,
  DepartmentStatus,
  ComplianceCategory,
  ComplianceStatus,
  RenewalFrequency,
  PriorityLevel,
  AuditAction,
  AuditEntity,
} from '../common/constants/enums.js';
import { UserRole, UserStatus } from '../common/types/role.types.js';

const DEFAULT_PASSWORD = 'Password123!';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * ComplianceFlow Database Seeder
 * Populates realistic Bangladeshi corporate compliance data for testing & cron jobs.
 */
async function seedDatabase() {
  const startTime = Date.now();
  console.log('🌱 Starting ComplianceFlow Production Database Seeder...');

  try {
    // 1. Establish database connection
    console.log('\n📡 Step 1: Connecting to MongoDB database...');
    await connectDB();

    // 2. Clear existing test data
    console.log('\n🧹 Step 2: Clearing existing test records...');
    await ComplianceRecordModel.deleteMany({});
    console.log('  ✔ Cleared Compliance Records');

    await DepartmentModel.deleteMany({});
    console.log('  ✔ Cleared Departments');

    await CompanyModel.deleteMany({});
    console.log('  ✔ Cleared Companies');

    await UserModel.deleteMany({});
    console.log('  ✔ Cleared Users');

    await AuditLogModel.deleteMany({});
    console.log('  ✔ Cleared Audit Logs');

    // Clean Better-Auth collections if present
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection('user').deleteMany({}).catch(() => {});
      await mongoose.connection.db.collection('account').deleteMany({}).catch(() => {});
      await mongoose.connection.db.collection('session').deleteMany({}).catch(() => {});
      await mongoose.connection.db.collection('verification').deleteMany({}).catch(() => {});
      console.log('  ✔ Cleared Better-Auth collections (user, account, session, verification)');
    }

    // 3. Seed Companies
    console.log('\n🏢 Step 3: Seeding Bangladeshi Corporate Entities...');

    const apexCompany = await CompanyModel.create({
      name: 'Bengal Manufacturing Ltd.',
      code: 'BENGAL',
      registrationNumber: 'REG-BD-2014-89234',
      taxId: 'TIN-849302192',
      industry: 'Manufacturing & Industrial Solutions',
      contactEmail: 'contact@bengalmanufacturing.com.bd',
      contactPhone: '+880 1712-345678',
      address: {
        street: 'Plot 14-16, Tongi Industrial Area',
        city: 'Gazipur',
        state: 'Dhaka Division',
        country: 'Bangladesh',
        zipCode: '1710',
      },
      status: CompanyStatus.ACTIVE,
      settings: {
        defaultCurrency: 'BDT',
        fiscalYearStartMonth: 7,
        autoArchiving: false,
        allowManagerApprovals: true,
        timezone: 'Asia/Dhaka',
      },
      reminderSettings: {
        defaultReminderDays: [60, 30, 15, 7, 1],
        notifyDepartmentManagers: true,
        notifyComplianceOfficers: true,
        emailEscalationDays: 3,
        digestFrequency: 'DAILY',
      },
    });
    console.log(`  ✔ Created Company: ${apexCompany.name} [ID: ${apexCompany._id}]`);

    const squareCompany = await CompanyModel.create({
      name: 'Rahman Textiles Ltd.',
      code: 'RAHMAN',
      registrationNumber: 'REG-BD-2011-10492',
      taxId: 'TIN-192039485',
      industry: 'Readymade Garments & Apparels',
      contactEmail: 'info@rahmantextiles.com.bd',
      contactPhone: '+880 1812-456789',
      address: {
        street: 'Plot 45, Sector 7, Uttara Commercial Area',
        city: 'Dhaka',
        state: 'Dhaka Division',
        country: 'Bangladesh',
        zipCode: '1230',
      },
      status: CompanyStatus.ACTIVE,
      settings: {
        defaultCurrency: 'BDT',
        fiscalYearStartMonth: 7,
        autoArchiving: false,
        allowManagerApprovals: true,
        timezone: 'Asia/Dhaka',
      },
      reminderSettings: {
        defaultReminderDays: [60, 30, 15, 7, 1],
        notifyDepartmentManagers: true,
        notifyComplianceOfficers: true,
        emailEscalationDays: 3,
        digestFrequency: 'DAILY',
      },
    });
    console.log(`  ✔ Created Company: ${squareCompany.name} [ID: ${squareCompany._id}]`);

    // 4. Seed Departments
    console.log('\n🏬 Step 4: Seeding Organizational Departments...');

    const apexSafetyDept = await DepartmentModel.create({
      name: 'Environment, Health & Safety (EHS)',
      code: 'EHS',
      companyId: apexCompany._id,
      description: 'Environment, Health, Fire Safety & Factory Safety Compliance',
      status: DepartmentStatus.ACTIVE,
    });

    const apexLegalDept = await DepartmentModel.create({
      name: 'Legal, Tax & Regulatory Affairs',
      code: 'LEGAL',
      companyId: apexCompany._id,
      description: 'Trade Licensing, Legal Filings & Government Regulatory Affairs',
      status: DepartmentStatus.ACTIVE,
    });

    const apexHrDept = await DepartmentModel.create({
      name: 'Human Resources & Administration',
      code: 'HR',
      companyId: apexCompany._id,
      description: 'Labor Law, Factory Labor Compliance, Staff Safety & Welfare',
      status: DepartmentStatus.ACTIVE,
    });
    console.log(`  ✔ Created 3 Departments for ${apexCompany.name}`);

    const squareQaDept = await DepartmentModel.create({
      name: 'Quality Assurance (QA)',
      code: 'QA',
      companyId: squareCompany._id,
      description: 'BSTI, ISO & Export Quality Assurance Standards',
      status: DepartmentStatus.ACTIVE,
    });

    const squareAuditDept = await DepartmentModel.create({
      name: 'Internal Audit & Corporate Governance',
      code: 'AUDIT',
      companyId: squareCompany._id,
      description: 'Statutory Audits, Import/Export Licensing & Internal Control',
      status: DepartmentStatus.ACTIVE,
    });
    console.log(`  ✔ Created 2 Departments for ${squareCompany.name}`);

    // 5. Seed Users & Hashes via Auth Service
    console.log('\n👥 Step 5: Seeding Users with Hashed Credentials (Password: "Password123!")...');

    const usersToSeed = [
      {
        name: 'Md. Arif Hossain',
        email: 'admin@complianceflow.com.bd',
        password: DEFAULT_PASSWORD,
        role: UserRole.SUPER_ADMIN,
        phoneNumber: '+880 1712-345678',
        companyId: undefined,
        departmentId: undefined,
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@rahmantextiles.com.bd',
        password: DEFAULT_PASSWORD,
        role: UserRole.ADMIN,
        phoneNumber: '+880 1812-456789',
        companyId: squareCompany._id,
        departmentId: squareQaDept._id,
      },
      {
        name: 'Md. Tanvir Ahmed',
        email: 'tanvir.ahmed@bengalmanufacturing.com.bd',
        password: DEFAULT_PASSWORD,
        role: UserRole.MANAGER,
        phoneNumber: '+880 1912-567890',
        companyId: apexCompany._id,
        departmentId: apexLegalDept._id,
      },
      {
        name: 'Farzana Yasmin',
        email: 'farzana.yasmin@rahmantextiles.com.bd',
        password: DEFAULT_PASSWORD,
        role: UserRole.MANAGER,
        phoneNumber: '+880 1612-334455',
        companyId: squareCompany._id,
        departmentId: squareAuditDept._id,
      },
    ];

    const seededUsers: Record<string, mongoose.Types.ObjectId> = {};

    for (const u of usersToSeed) {
      // Register account via Better Auth core engine (handles secure password hashing)
      try {
        await auth.api.signUpEmail({
          body: {
            email: u.email.toLowerCase(),
            password: u.password,
            name: u.name,
          },
        });
      } catch (authErr) {
        console.warn(`  ⚠️ Auth registration notice for ${u.email}:`, (authErr as Error).message);
      }

      // Upsert extended User model in MongoDB
      const dbUser = await UserModel.findOneAndUpdate(
        { email: u.email.toLowerCase() },
        {
          name: u.name,
          email: u.email.toLowerCase(),
          role: u.role,
          status: UserStatus.ACTIVE,
          companyId: u.companyId,
          departmentId: u.departmentId,
          phoneNumber: u.phoneNumber,
        },
        { upsert: true, new: true }
      );

      seededUsers[u.email] = dbUser._id;
      console.log(`  ✔ Seeded User: ${u.name} (${u.email}) [Role: ${u.role}]`);
    }

    // Update Departments with Manager References
    await DepartmentModel.findByIdAndUpdate(apexLegalDept._id, {
      managerId: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
    });

    await DepartmentModel.findByIdAndUpdate(squareQaDept._id, {
      managerId: seededUsers['nusrat.jahan@rahmantextiles.com.bd'],
    });

    // 6. Seed Realistic Bangladeshi Compliance Records
    console.log('\n📜 Step 6: Seeding Compliance Documents for Cron Job & Expiry Testing...');

    const now = new Date();

    const complianceRecords = [
      {
        documentName: 'Trade License 2025-26 (DNCC)',
        licenseNumber: 'TL-DNCC-2025-089421',
        category: ComplianceCategory.LEGAL,
        companyId: apexCompany._id,
        departmentId: apexLegalDept._id,
        responsiblePersonId: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
        issuingAuthority: 'Dhaka North City Corporation (DNCC)',
        issueDate: new Date(now.getTime() - 364 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 1 * ONE_DAY_MS), // 1 day remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.CRITICAL,
        status: ComplianceStatus.EXPIRING_SOON,
        notes: 'Annual business trade license renewal submitted to DNCC Zonal Office 3.',
        autoRenewalEnabled: false,
        createdBy: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
      },
      {
        documentName: 'Fire Safety Certificate (FSCD)',
        licenseNumber: 'FSCD-DHAKA-88219-B',
        category: ComplianceCategory.SAFETY,
        companyId: apexCompany._id,
        departmentId: apexSafetyDept._id,
        responsiblePersonId: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
        issuingAuthority: 'Fire Service and Civil Defence (FSCD), Bangladesh',
        issueDate: new Date(now.getTime() - 358 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 7 * ONE_DAY_MS), // 7 days remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.CRITICAL,
        status: ComplianceStatus.EXPIRING_SOON,
        notes: 'Annual fire safety inspection pending scheduled audit.',
        autoRenewalEnabled: false,
        createdBy: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
      },
      {
        documentName: 'Environmental Clearance Certificate (DoE)',
        licenseNumber: 'DOE-ECC-2023-4412',
        category: ComplianceCategory.ENVIRONMENTAL,
        companyId: apexCompany._id,
        departmentId: apexSafetyDept._id,
        responsiblePersonId: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
        issuingAuthority: 'Department of Environment (DoE), Ministry of Environment',
        issueDate: new Date(now.getTime() - 350 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 15 * ONE_DAY_MS), // 15 days remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.HIGH,
        status: ComplianceStatus.EXPIRING_SOON,
        notes: 'Effluent Treatment Plant (ETP) audit report submitted for renewal.',
        autoRenewalEnabled: false,
        createdBy: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
      },
      {
        documentName: 'Factory Inspection License (DIFE)',
        licenseNumber: 'DIFE-FACTORY-772910',
        category: ComplianceCategory.SAFETY,
        companyId: apexCompany._id,
        departmentId: apexSafetyDept._id,
        responsiblePersonId: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
        issuingAuthority: 'Department of Inspection for Factories and Establishments (DIFE)',
        issueDate: new Date(now.getTime() - 335 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 30 * ONE_DAY_MS), // 30 days remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.HIGH,
        status: ComplianceStatus.EXPIRING_SOON,
        notes: 'DIFE annual factory floor and worker safety inspection report attached.',
        autoRenewalEnabled: false,
        createdBy: seededUsers['tanvir.ahmed@bengalmanufacturing.com.bd'],
      },
      {
        documentName: 'BSTI Quality Standard Certification',
        licenseNumber: 'BSTI-CERT-2024-9912',
        category: ComplianceCategory.OPERATIONAL,
        companyId: squareCompany._id,
        departmentId: squareQaDept._id,
        responsiblePersonId: seededUsers['nusrat.jahan@rahmantextiles.com.bd'],
        issuingAuthority: 'Bangladesh Standards and Testing Institution (BSTI)',
        issueDate: new Date(now.getTime() - 370 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() - 5 * ONE_DAY_MS), // 5 days ago (EXPIRED)
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.CRITICAL,
        status: ComplianceStatus.EXPIRED,
        notes: 'Certification expired 5 days ago. Immediate renewal fee payment required.',
        autoRenewalEnabled: false,
        createdBy: seededUsers['nusrat.jahan@rahmantextiles.com.bd'],
      },
      {
        documentName: 'Import Registration Certificate (IRC)',
        licenseNumber: 'IRC-DHAKA-BD-102938',
        category: ComplianceCategory.LEGAL,
        companyId: squareCompany._id,
        departmentId: squareAuditDept._id,
        responsiblePersonId: seededUsers['farzana.yasmin@rahmantextiles.com.bd'],
        issuingAuthority: 'Office of the Chief Controller of Imports & Exports (CCI&E)',
        issueDate: new Date(now.getTime() - 125 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 240 * ONE_DAY_MS), // 8 months remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.MEDIUM,
        status: ComplianceStatus.ACTIVE,
        notes: 'Active import registration certificate for manufacturing materials.',
        autoRenewalEnabled: true,
        createdBy: seededUsers['farzana.yasmin@rahmantextiles.com.bd'],
      },
      {
        documentName: 'ISO 9001:2015 Quality Management',
        licenseNumber: 'ISO-9001-BD-883920',
        category: ComplianceCategory.OPERATIONAL,
        companyId: squareCompany._id,
        departmentId: squareAuditDept._id,
        responsiblePersonId: seededUsers['farzana.yasmin@rahmantextiles.com.bd'],
        issuingAuthority: 'SGS Bangladesh Limited (ISO Registrar)',
        issueDate: new Date(now.getTime() - 180 * ONE_DAY_MS),
        expiryDate: new Date(now.getTime() + 365 * ONE_DAY_MS), // 12 months remaining
        renewalFrequency: RenewalFrequency.ANNUAL,
        priority: PriorityLevel.MEDIUM,
        status: ComplianceStatus.ACTIVE,
        notes: 'Valid international quality management certification.',
        autoRenewalEnabled: true,
        createdBy: seededUsers['farzana.yasmin@rahmantextiles.com.bd'],
      },
    ];

    for (const doc of complianceRecords) {
      const createdDoc = await ComplianceRecordModel.create(doc);
      console.log(`  ✔ Created Document: "${createdDoc.documentName}" [Status: ${createdDoc.status}, License: ${createdDoc.licenseNumber}]`);
    }

    // 7. Seed Initial Audit Logs
    console.log('\n📋 Step 7: Seeding System Initial Audit Logs...');
    await AuditLogModel.create({
      userId: seededUsers['admin@complianceflow.com.bd'],
      userEmail: 'admin@complianceflow.com.bd',
      userRole: UserRole.SUPER_ADMIN,
      action: AuditAction.CREATE,
      entity: AuditEntity.SYSTEM,
      entityId: 'seed_init',
      details: { message: 'Database initialized with Bangladeshi corporate compliance seed data.' },
      ipAddress: '127.0.0.1',
    });
    console.log('  ✔ Created Initial Audit Log Entry');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ ComplianceFlow Database Seeding completed successfully in ${duration}s!`);
  } catch (error) {
    console.error('\n💥 Database Seeding Failed:', error);
    process.exitCode = 1;
  } finally {
    console.log('\n🛑 Closing database connection...');
    await disconnectDB();
  }
}

// Execute database seeder
seedDatabase();

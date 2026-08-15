import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import { NavRoute } from '../components/layout/Sidebar';
import { ApiService } from '../services/api';
import UserProfilePage from './UserProfilePage';
import ChangePasswordPage from './ChangePasswordPage';
import SmartDashboardView from '../components/dashboard/SmartDashboardView';
import ComplianceRecordsView from '../components/records/ComplianceRecordsView';
import RenewalWorkflowView from '../components/renewals/RenewalWorkflowView';
import ComplianceCalendarView from '../components/calendar/ComplianceCalendarView';
import CompanyManagementView from '../components/organization/CompanyManagementView';
import DepartmentManagementView from '../components/organization/DepartmentManagementView';
import UserManagementView from '../components/organization/UserManagementView';
import NotificationsView from '../components/notifications/NotificationsView';
import GlobalSearchView from '../components/search/GlobalSearchView';
import ComplianceReportsView from '../components/reports/ComplianceReportsView';
import AuditLogsView from '../components/audit/AuditLogsView';
import ForbiddenView from '../components/common/ForbiddenView';
import { canAccessRoute } from '../lib/permissions';
import {
  ComplianceRecord,
  DashboardMetrics,
  Company,
  User,
  AuditLog,
  NotificationItem,
  DepartmentItem,
} from '../types';

export default function Workspace() {
  const { user, selectedCompanyScope, companies, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const scope = selectedCompanyScope === 'all' ? undefined : selectedCompanyScope;
      
      const [mRes, nRes] = await Promise.all([
        ApiService.getDashboardMetrics(scope),
        user ? ApiService.getNotifications(user.id) : Promise.resolve({ success: true, notifications: [] }),
      ]);

      if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
      if (nRes.success && nRes.notifications) setNotifications(nRes.notifications);
    } catch (err) {
      console.error('Workspace load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyScope, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const warningCount = metrics ? metrics.warningCount + metrics.expiredCount : 0;

  // Check if current route is authorized for user's role
  const isAuthorized = canAccessRoute(user, currentRoute);

  return (
    <AppShell
      currentRoute={currentRoute}
      onNavigate={setCurrentRoute}
      unreadNotifCount={unreadNotifCount}
      warningCount={warningCount}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Loading Workspace...</p>
        </div>
      ) : !isAuthorized ? (
        <ForbiddenView
          onReturnDashboard={() => setCurrentRoute('dashboard')}
          requiredRole="Administrator"
        />
      ) : (
        <>
          {/* Smart Dashboard View */}
          {(currentRoute === 'dashboard' || !currentRoute) && (
            <SmartDashboardView onNavigate={setCurrentRoute} />
          )}

          {/* Compliance Records View */}
          {currentRoute === 'records' && <ComplianceRecordsView />}

          {/* Renewal Workflow */}
          {currentRoute === 'renewals' && <RenewalWorkflowView />}

          {/* Compliance Calendar */}
          {currentRoute === 'calendar' && <ComplianceCalendarView />}

          {/* Compliance Reports */}
          {currentRoute === 'reports' && <ComplianceReportsView />}

          {/* Audit Logs */}
          {currentRoute === 'audit' && <AuditLogsView />}

          {/* Company & Workspace Management */}
          {currentRoute === 'companies' && <CompanyManagementView />}

          {/* Department Management */}
          {currentRoute === 'departments' && <DepartmentManagementView />}

          {/* User Management */}
          {currentRoute === 'users' && <UserManagementView />}

          {/* Notifications */}
          {currentRoute === 'notifications' && <NotificationsView />}

          {/* Global Search */}
          {currentRoute === 'search' && <GlobalSearchView />}

          {/* User Profile Page Route */}
          {currentRoute === 'profile' && <UserProfilePage />}

          {/* Change Password Page Route */}
          {currentRoute === 'change_password' && <ChangePasswordPage />}
        </>
      )}
    </AppShell>
  );
}


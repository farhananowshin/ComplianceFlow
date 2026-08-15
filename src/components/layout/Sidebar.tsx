import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { canAccessRoute, getRoleCategory, getRoleLabel } from '../../lib/permissions';
import { User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard,
  FileCheck2,
  RefreshCw,
  Calendar,
  Building2,
  FileSpreadsheet,
  History,
  Bell,
  ShieldCheck,
  ChevronLeft,
  UserCheck,
  User,
  Circle,
} from 'lucide-react';

export type NavRoute =
  | 'dashboard'
  | 'records'
  | 'renewals'
  | 'calendar'
  | 'companies'
  | 'departments'
  | 'users'
  | 'reports'
  | 'audit'
  | 'notifications'
  | 'qr_verify'
  | 'search'
  | 'profile'
  | 'change_password';

export interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  warningCount?: number;
  unreadCount?: number;
}

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeVariant?: 'rose' | 'amber' | 'blue' | 'emerald';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  warningCount = 0,
  unreadCount = 0,
}) => {
  const { user } = useAuth();

  const userObj: UserType = {
    id: (user as any)?.id || 'usr_current',
    name: user?.name || 'User',
    email: user?.email || 'user@company.com',
    role: (user?.role || 'EMPLOYEE') as any,
    companyId: (user as any)?.companyId || 'comp_01',
    companyName: (user as any)?.companyName || 'Company',
    department: (user as any)?.department || 'Operations',
    status: 'active',
  };

  const isAdmin = getRoleCategory(userObj.role) === 'admin';

  // Navigation Items defined per role
  const navItems: NavItem[] = isAdmin
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'records',
          label: 'Documents',
          icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
          badge: warningCount > 0 ? warningCount : undefined,
          badgeVariant: 'rose',
        },
        {
          id: 'renewals',
          label: 'Renewals',
          icon: <RefreshCw className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'users',
          label: 'Users',
          icon: <UserCheck className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'companies',
          label: 'Company',
          icon: <Building2 className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: <History className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-4 h-4 shrink-0" />,
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeVariant: 'amber',
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: <User className="w-4 h-4 shrink-0" />,
        },
      ]
    : [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'records',
          label: 'Assigned Documents',
          icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
          badge: warningCount > 0 ? warningCount : undefined,
          badgeVariant: 'rose',
        },
        {
          id: 'renewals',
          label: 'Renew Document',
          icon: <RefreshCw className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-4 h-4 shrink-0" />,
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeVariant: 'amber',
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: <User className="w-4 h-4 shrink-0" />,
        },
      ];

  const allowedItems = navItems.filter((item) => canAccessRoute(userObj, item.id));

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      aria-label="Sidebar navigation"
      className="h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col relative z-40 select-none shadow-xl overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-slate-100" aria-hidden="true" />
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight font-display">
                  ComplianceFlow
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Compliance Management
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden lg:flex items-center justify-center shrink-0 cursor-pointer"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180 text-blue-400' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {allowedItems.map((item) => {
          const isActive = currentRoute === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r" />
              )}

              {/* Icon */}
              <span
                className={`transition-colors shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </span>

              {/* Label */}
              {!isCollapsed && (
                <span className="truncate flex-1 text-left tracking-tight">
                  {item.label}
                </span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 shadow-2xs ${
                    item.badgeVariant === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed Badge Dot Indicator */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
              )}
            </motion.button>
          );
        })}
      </nav>


    </motion.aside>
  );
};

export default Sidebar;

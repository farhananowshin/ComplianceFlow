import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbsProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  records: 'Compliance Records',
  renewals: 'Renewal Workflows',
  calendar: 'Compliance Calendar',
  companies: 'Tenant Companies',
  departments: 'Departments',
  users: 'User Directory',
  notifications: 'In-App Alerts',
  reports: 'Analytics & Reports',
  audit: 'Audit Trails',
  qr_verify: 'Public QR Verification',
  search: 'Global Search',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentRoute, onNavigate }) => {
  const currentLabel = ROUTE_LABELS[currentRoute] || currentRoute;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 select-none">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
      <span className="font-semibold text-slate-900 dark:text-slate-100">{currentLabel}</span>
    </nav>
  );
};

export default Breadcrumbs;

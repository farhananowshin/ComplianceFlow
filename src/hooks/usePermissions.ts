import { useAuth } from '../context/AuthContext';
import {
  normalizeRole,
  canAccessNavRoute,
  canPerformAction,
  CanonicalRole,
  PermissionAction,
} from '../lib/permissions';
import { NavRoute } from '../components/layout/Sidebar';

export function usePermissions() {
  const { user } = useAuth();
  const canonicalRole: CanonicalRole = normalizeRole(user?.role);

  const isAdmin = canonicalRole === 'ADMIN';
  const isEmployee = canonicalRole === 'EMPLOYEE';

  return {
    user,
    role: user?.role,
    canonicalRole,
    isAdmin,
    isEmployee,
    canAccessRoute: (route: NavRoute) => canAccessNavRoute(user?.role, route),
    canPerformAction: (action: PermissionAction) => canPerformAction(user?.role, action),
  };
}


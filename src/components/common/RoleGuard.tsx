import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { CanonicalRole, PermissionAction } from '../../lib/permissions';
import { NavRoute } from '../layout/Sidebar';
import { AccessDenied } from './AccessDenied';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: CanonicalRole[];
  route?: NavRoute;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  showAccessDeniedView?: boolean;
  onReturnHome?: () => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  route,
  action,
  fallback = null,
  showAccessDeniedView = true,
  onReturnHome,
}) => {
  const { canonicalRole, canAccessRoute, canPerformAction } = usePermissions();

  let hasPermission = true;

  if (allowedRoles && allowedRoles.length > 0) {
    hasPermission = allowedRoles.includes(canonicalRole);
  }

  if (hasPermission && route) {
    hasPermission = canAccessRoute(route);
  }

  if (hasPermission && action) {
    hasPermission = canPerformAction(action);
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback !== null) {
    return <>{fallback}</>;
  }

  if (showAccessDeniedView) {
    return (
      <AccessDenied
        requiredRole={allowedRoles?.join(' or ')}
        onReturnHome={onReturnHome}
      />
    );
  }

  return null;
};

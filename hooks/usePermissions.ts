
import { useAuth } from './useAuth';
import { MOCK_PERMISSIONS } from '../constants';
import { UserRole } from '../types';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) {
      return false;
    }

    // SuperAdmin has all permissions
    // FIX: Used UserRole enum member instead of a string to fix the type error.
    if (user.roles.includes(UserRole.SuperAdmin)) {
        return true;
    }
    
    // Check if any of the user's roles include the required permission
    return user.roles.some(role => {
      const permissions = MOCK_PERMISSIONS[role];
      if (permissions.includes('*')) return true; // Role has wildcard permission
      return permissions.includes(requiredPermission);
    });
  };

  return { hasPermission };
};

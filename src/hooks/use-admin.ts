import { useUser } from '@/components/layout/UserContext';
import { isAdminUser } from '@/config/admin';

/**
 * Hook that provides admin status and utilities for the current user
 */
export function useAdmin() {
  const { user } = useUser();
  
  const isAdmin = isAdminUser(user);
  
  return {
    isAdmin,
    user,
    // Helper function for conditional rendering
    renderIfAdmin: (component: React.ReactNode) => isAdmin ? component : null,
  };
} 
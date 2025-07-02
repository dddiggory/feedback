import { useAdmin } from '@/hooks/use-admin';

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders its children if the current user is an admin
 */
export function AdminGate({ children, fallback = null }: AdminGateProps) {
  const { isAdmin } = useAdmin();
  
  return isAdmin ? <>{children}</> : <>{fallback}</>;
} 
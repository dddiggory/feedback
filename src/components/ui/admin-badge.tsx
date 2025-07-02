import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useAdmin } from '@/hooks/use-admin';

/**
 * Small admin badge that appears in the navigation for admin users
 */
export function AdminBadge() {
  const { isAdmin } = useAdmin();
  
  if (!isAdmin) return null;
  
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 text-white text-xs font-medium rounded-full shadow-sm">
      <ShieldCheckIcon className="h-3.5 w-3.5" />
      <span>Admin</span>
    </div>
  );
} 
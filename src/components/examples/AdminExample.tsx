/**
 * Example component demonstrating different ways to use the admin system
 * You can delete this file - it's just for demonstration
 */

import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@/components/layout/UserContext';
import { AdminGate } from '@/components/ui/admin-gate';
import { isAdminUser } from '@/config/admin';

export function AdminExample() {
  // Method 1: Using the useAdmin hook
  const { isAdmin, renderIfAdmin } = useAdmin();
  
  // Method 2: Using the UserContext directly (includes isAdmin)
  const { user, isAdmin: isAdminFromContext } = useUser();
  
  // Method 3: Using the utility function directly
  const isAdminDirect = isAdminUser(user);

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold">Admin System Examples</h2>
      
      {/* Method 1: Conditional rendering with useAdmin hook */}
      {isAdmin && (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <h3 className="font-semibold text-red-800">Admin Only Section (useAdmin hook)</h3>
          <p className="text-red-700">This section only shows for admins</p>
          <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Admin Action Button
          </button>
        </div>
      )}
      
      {/* Method 2: Using renderIfAdmin helper */}
      {renderIfAdmin(
        <div className="p-4 bg-blue-100 border border-blue-300 rounded">
          <h3 className="font-semibold text-blue-800">Admin Section (renderIfAdmin)</h3>
          <p className="text-blue-700">This uses the renderIfAdmin helper function</p>
        </div>
      )}
      
      {/* Method 3: Using AdminGate component */}
      <AdminGate
        fallback={
          <div className="p-4 bg-gray-100 border border-gray-300 rounded">
            <p className="text-gray-600">You need admin permissions to see the content here.</p>
          </div>
        }
      >
        <div className="p-4 bg-green-100 border border-green-300 rounded">
          <h3 className="font-semibold text-green-800">Admin Section (AdminGate)</h3>
          <p className="text-green-700">This uses the AdminGate component with fallback</p>
          <div className="mt-2 space-x-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Delete All Data
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Manage Users
            </button>
          </div>
        </div>
      </AdminGate>
      
      {/* Method 4: Using UserContext directly */}
      {isAdminFromContext && (
        <div className="p-4 bg-purple-100 border border-purple-300 rounded">
          <h3 className="font-semibold text-purple-800">Admin Section (UserContext)</h3>
          <p className="text-purple-700">This uses isAdmin from UserContext directly</p>
        </div>
      )}
      
      {/* Debug info */}
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-semibold text-yellow-800">Debug Info</h3>
        <p className="text-yellow-700">Current user: {user?.email || 'Not logged in'}</p>
        <p className="text-yellow-700">Is Admin: {isAdmin.toString()}</p>
        <p className="text-yellow-700">All methods agree: {(isAdmin === isAdminFromContext && isAdmin === isAdminDirect).toString()}</p>
      </div>
    </div>
  );
} 
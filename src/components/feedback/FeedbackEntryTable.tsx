import React from 'react';

interface FeedbackEntryTableProps {
  // Add props as needed
}

export function FeedbackEntryTable({}: FeedbackEntryTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">Feedback</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">2024-03-20</td>
            <td className="px-4 py-2">John Doe</td>
            <td className="px-4 py-2">Great product! Would love to see more features.</td>
            <td className="px-4 py-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Reviewed
              </span>
            </td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">2024-03-19</td>
            <td className="px-4 py-2">Jane Smith</td>
            <td className="px-4 py-2">Found a bug in the dashboard view.</td>
            <td className="px-4 py-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                In Progress
              </span>
            </td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">2024-03-18</td>
            <td className="px-4 py-2">Mike Johnson</td>
            <td className="px-4 py-2">Feature request: Dark mode support</td>
            <td className="px-4 py-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                New
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 
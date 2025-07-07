import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getSeverityStyle(severity: string): string {
  const normalized = severity.toLowerCase();
  switch (normalized) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
    case 'med':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusStyle(status: string): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'open':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    case 'shipped':
      return 'bg-green-50 text-green-700 ring-green-600/20';
    case 'closed':
      return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    case 'in_progress':
      return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

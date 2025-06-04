import { Sidebar } from './Sidebar';
import { LogFeedbackDialog } from '../feedback/LogFeedbackDialog';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="bg-white shadow">
          <div className="px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex gap-4">

              <LogFeedbackDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-2.5 rounded-xl bg-black px-6 py-3.5 text-lg font-semibold text-white shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Log Feedback
                  </button>
                }
              />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
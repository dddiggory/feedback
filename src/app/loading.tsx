import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import { KeyboardShortcutHint } from '@/components/ui/keyboard-shortcut-hint'
import { DocumentIcon, CalendarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Loading() {
  return (
    <Layout>
      <div className="mx-auto max-w-[80vw]">
        {/* Search Box Skeleton */}
        <div className="mt-8 mb-6">
          <div className="animated-gradient-bg">
            <div className="p-4">
              <div className="w-full rounded-xl bg-green-200 overflow-hidden">
                <div className="min-h-20 bg-white border-2 border-gray-300 rounded-none flex items-center px-6 py-3">
                  <span className="text-2xl font-medium text-gray-800 opacity-90 pl-6">
                    Start typing to add or view customer feedback...
                  </span>
                </div>
              </div>
            </div>
          </div>
          <KeyboardShortcutHint />
        </div>

        {/* Navigation Links */}
        <div className="text-white text-xs 2xl:text-base text-center text-md cursor-pointer max-w-[55vw] mx-auto grid grid-cols-12">
          <Link href="/about" className="flex items-center justify-center gap-2 hover:underline col-span-6">
            <DocumentIcon className="w-4 h-4" />
            Readme: What is this? What is it for? What is it NOT for?
          </Link>
          <Link href="https://www.notion.so/vercel/Launch-Calendar-4b4542b694974f269bb81b3ccc99e009" target="_blank" className="flex items-center justify-center gap-2 hover:underline col-span-3">
            <CalendarIcon className="w-4 h-4" />
            Launch Calendar
          </Link>
          <p className="cursor-not-allowed flex items-center justify-center gap-2 hover:underline col-span-3">
            <CalendarIcon className="w-4 h-4" />
            EPD Anti-Roadmap (soon!)
          </p>
        </div>

        <div className="grid grid-cols-[1fr_0.45fr] gap-8 py-8">
          {/* Recent Feedback Entries Skeleton */}
          <div className="">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-medium text-gray-800">Activity Feed / Recent Feedback Logged</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 hidden">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* product areas, headerless */}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter & Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 10 }, (_, i) => `entry-${i}`).map((key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="pl-6 py-4 min-w-[10rem] max-w-[15rem] align-middle">
                        <div className="flex flex-col min-w-[10rem] max-w-[15rem]">
                          <Skeleton className="h-4 w-48 bg-gray-300 mb-1" />
                          <div className="flex items-center gap-2 mt-1">
                            <Skeleton className="h-5 w-5 bg-gray-300 rounded-full" />
                            <Skeleton className="h-3 w-32 bg-gray-300" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[18rem] xl:max-w-[28rem] 2xl:max-w-[36rem] hidden xl:table-cell align-top">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Skeleton className="h-3 w-full bg-gray-300 mb-1" />
                            <Skeleton className="h-3 w-3/4 bg-gray-300 mb-1" />
                            <Skeleton className="h-3 w-1/2 bg-gray-300" />
                          </div>
                          <Skeleton className="h-8 w-8 bg-gray-300 rounded" />
                        </div>
                      </td>
                      <td className="px-1 py-4 max-w-[6rem]">
                        <div className="flex flex-wrap gap-1 max-w-[6rem]">
                          <Skeleton className="h-5 w-16 bg-gray-300 rounded-full" />
                          <Skeleton className="h-5 w-12 bg-gray-300 rounded-full" />
                        </div>
                      </td>
                      <td className="pl-1 pr-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-6 w-6 bg-gray-300 rounded-full mr-2" />
                          <div className="flex flex-col">
                            <Skeleton className="h-3 w-20 bg-gray-300 mb-1" />
                            <Skeleton className="h-3 w-16 bg-gray-300" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submitter Leaderboard Skeleton */}
          <div className="">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden pb-5">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-medium text-gray-800">ITG Hall of Fame</h2>
                <h3 className="text-sm text-gray-500 mt-1">(Top Submitters Past 30 Days)</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 10 }, (_, i) => `submitter-${i}`).map((key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Skeleton className="h-6 w-6 bg-gray-300 rounded-full mr-2" />
                          <div>
                            <div className="font-medium">
                              <Skeleton className="h-4 w-32 bg-gray-300 mb-1" />
                            </div>
                            <div className="text-xs text-gray-500">
                              <Skeleton className="h-3 w-40 bg-gray-300" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        <Skeleton className="h-4 w-8 bg-gray-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 
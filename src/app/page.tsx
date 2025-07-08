import Link from 'next/link';
import Image from 'next/image';
import { DocumentIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { FeedbackSearchBox } from '@/components/feedback/FeedbackSearchBox';
import { EntryViewButton } from '@/components/feedback/EntryViewButton';
import { getRandomColor } from "@/lib/colors";
import { formatARR } from "@/lib/format";
import { getInitials } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch recent feedback entries
  const { data: recentEntries } = await supabase
    .from('entries_with_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch top submitters
  const { data: topSubmitters } = await supabase
    .from('top_submitters_30d')
    .select('*')
    .order('total_entries', { ascending: false })
    .limit(10);



  return (
    <Layout>
      <div className="mx-auto max-w-[80vw]">



        {/* Search Box */}
        <div className="mt-8 mb-6">
          <div className="animated-gradient-bg">
            <div className="p-4">
              <FeedbackSearchBox />
            </div>
          </div>
        </div>

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
          {/* Recent Feedback Entries */}
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
                  {recentEntries?.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="pl-6 py-4 min-w-[10rem] max-w-[15rem] align-middle">
                        <div className="flex flex-col min-w-[10rem] max-w-[15rem]">
                          <Link
                            href={`/feedback/${entry.feedback_item_slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline line-clamp-2 min-w-[10rem] max-w-[15rem]"
                          >
                            {entry.feedback_item_title}
                          </Link>
                          {entry.account_name ? (
                            <div className="flex items-center gap-2 mt-1">
                              {(() => {
                                // Clean up the website URL for logo.dev (same logic as FeedbackEntriesTable)
                                const companyWebsite = entry.company_website;
                                const cleanWebsite = companyWebsite
                                  ? companyWebsite
                                      .replace(/^https?:\/\//, '') // Remove protocol
                                      .replace(/^www\./, '')       // Remove www prefix
                                      .replace(/\/$/, '')          // Remove trailing slash
                                      .split('/')[0]               // Remove path - keep only domain
                                      .toLowerCase()               // Ensure lowercase
                                  : null;

                                // Generate logo URL if company website is available
                                const logoUrl = cleanWebsite
                                  ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=20&format=webp`
                                  : null;

                                return logoUrl ? (
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <Image
                                      src={logoUrl}
                                      alt={`${entry.account_name} logo`}
                                      width={20}
                                      height={20}
                                      className="object-contain"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-[10px] font-medium">
                                      {entry.account_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                );
                              })()}
                              <span className="text-xs text-gray-500 truncate flex-1">
                                <Link
                                  href={`/accounts/${encodeURIComponent(entry.account_name.toLowerCase().replace(/\s+/g, '-'))}`}
                                  className="hover:underline text-gray-700"
                                >
                                  {entry.account_name.length > 40 ? entry.account_name.slice(0, 40) + '…' : entry.account_name}
                                </Link>
                                {entry.total_arr ? ` • ${formatARR(entry.total_arr)}` : ''}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[18rem] xl:max-w-[28rem] 2xl:max-w-[36rem] hidden xl:table-cell align-top">
                        <div className="flex items-center gap-2">
                          {entry.entry_key && entry.feedback_item_slug ? (
                            <Link
                              href={`/feedback/${entry.feedback_item_slug}/entries/${entry.entry_key}`}
                              className="block max-w-[16rem] xl:max-w-[26rem] 2xl:max-w-[34rem] text-xs text-gray-700 break-words flex-1 cursor-pointer hover:text-gray-900 hover:underline overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                              title={entry.entry_description}
                            >
                              {entry.entry_description}
                            </Link>
                          ) : (
                            <span
                              className="block max-w-[16rem] xl:max-w-[26rem] 2xl:max-w-[34rem] text-xs text-gray-700 break-words flex-1 overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                              title={entry.entry_description}
                            >
                              {entry.entry_description}
                            </span>
                          )}
                          {entry.entry_key && entry.feedback_item_slug && (
                            <div className="flex-shrink-0">
                              <EntryViewButton
                                feedbackItemSlug={entry.feedback_item_slug}
                                entryKey={entry.entry_key}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-4 max-w-[6rem]">
                        {Array.isArray(entry.product_area_names) && entry.product_area_names.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[6rem]">
                            {entry.product_area_names.map((area: string, idx: number) => {
                              // Helper function to wrap text if it exceeds 16 characters
                              const wrapText = (text: string) => {
                                if (text.length <= 16) return text;

                                const words = text.split(' ');
                                const lines = [];
                                let currentLine = '';

                                for (const word of words) {
                                  if (currentLine.length === 0) {
                                    currentLine = word;
                                  } else if ((currentLine + ' ' + word).length <= 16) {
                                    currentLine += ' ' + word;
                                  } else {
                                    lines.push(currentLine);
                                    currentLine = word;
                                  }
                                }
                                if (currentLine) lines.push(currentLine);

                                return lines.join('\n');
                              };

                              const wrappedText = wrapText(area);
                              const needsWrapping = wrappedText.includes('\n');

                              return entry.product_area_slugs && entry.product_area_slugs[idx] ? (
                                <Link
                                  key={area + idx}
                                  href={`/areas/${entry.product_area_slugs[idx]}`}
                                  className={`${needsWrapping ? 'block' : 'inline-block'} px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium border border-emerald-200 hover:bg-emerald-200 transition-colors ${needsWrapping ? 'whitespace-pre-line' : ''}`}
                                >
                                  {wrappedText}
                                </Link>
                              ) : (
                                <span
                                  key={area + idx}
                                  className={`${needsWrapping ? 'block' : 'inline-block'} px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium border border-emerald-200 ${needsWrapping ? 'whitespace-pre-line' : ''}`}
                                >
                                  {wrappedText}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="pl-1 pr-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.submitter_avatar ? (
                            <Image
                              src={entry.submitter_avatar}
                              alt={`${entry.submitter_name}'s avatar`}
                              width={25}
                              height={25}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : entry.submitter_name ? (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              {getInitials(entry.submitter_name)}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              ?
                            </div>
                          )}
                          <div className="flex flex-col">
                            {entry.created_by_user_id ? (
                              <Link
                                href={`/user/${entry.created_by_user_id}`}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {entry.submitter_name}
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-900">{entry.submitter_name}</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submitter Leaderboard */}
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
                  {topSubmitters?.map((submitter, index) => (
                    <tr key={submitter.submitter_email || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {submitter.submitter_avatar ? (
                            <Image
                              src={submitter.submitter_avatar}
                              alt={`${submitter.submitter_name || 'User'}'s avatar`}
                              width={50}
                              height={50}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : submitter.submitter_name ? (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              {getInitials(submitter.submitter_name)}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              ?
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {submitter.submitter_name || 'Unknown User'}
                            </div>
                            {submitter.submitter_email && (
                              <div className="text-xs text-gray-500">
                                {submitter.submitter_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {submitter.total_entries}
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
  );
}

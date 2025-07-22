import type { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { AccountDetailContent } from '@/components/accounts/AccountDetailContent'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  
  // Get entries for this account by website domain
  const { data: entries } = await supabase
    .from('entries_with_data')
    .select('account_name, company_website, current_arr, open_opp_arr')
    .order('created_at', { ascending: false })

  if (!entries) {
    return {
      title: "▲ vercel/Feedback - Account"
    }
  }

  // Filter entries that match this account's website slug
  const filteredEntries = entries.filter(entry => {
    if (!entry.company_website) return false;
    
    const cleanWebsite = entry.company_website
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0]
      .toLowerCase();
    
    return cleanWebsite === slug;
  });

  if (filteredEntries.length === 0) {
    return {
      title: "▲ vercel/Feedback - Account"
    }
  }

  const accountName = filteredEntries[0].account_name
  const entryCount = filteredEntries.length
  const currentARR = filteredEntries.reduce((sum, entry) => sum + (entry.current_arr || 0), 0)
  const openOppARR = filteredEntries.reduce((sum, entry) => sum + (entry.open_opp_arr || 0), 0)

  const title = `▲ ${accountName} - Customer Feedback`
  const description = `${entryCount} feedback entries from ${accountName} • $${Math.floor(currentARR / 1000)}k current ARR • $${Math.floor(openOppARR / 1000)}k opportunity impact`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: "Vercel Feedback",
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <Layout>
      <AccountDetailContent slug={slug} />
    </Layout>
  )
} 
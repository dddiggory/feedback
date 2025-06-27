import { NextRequest, NextResponse } from 'next/server'
import { searchAccounts, getInitialAccounts } from '@/lib/services/account-opportunity'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('q') || ''
    
    let accounts
    if (searchTerm.trim()) {
      accounts = await searchAccounts(searchTerm)
    } else {
      accounts = await getInitialAccounts()
    }
    
    const response = NextResponse.json({ 
      success: true, 
      accounts,
      count: accounts.length
    })

    // Add Vercel edge caching headers
    // Cache for 5 minutes - good balance between freshness and performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to search accounts',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
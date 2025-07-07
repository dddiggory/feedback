import { NextRequest, NextResponse } from 'next/server'
import { getOpportunitiesByAccountId } from '@/lib/services/opportunity'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId') || ''
  if (!accountId) {
    return NextResponse.json({ success: false, message: 'Missing accountId' }, { status: 400 })
  }
  try {
    const opportunities = await getOpportunitiesByAccountId(accountId)
    return NextResponse.json({ success: true, opportunities })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch opportunities' }, { status: 500 })
  }
} 
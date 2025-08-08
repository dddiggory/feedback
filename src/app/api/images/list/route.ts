import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { createClient } from '@/lib/supabase/server'

export async function GET(): Promise<NextResponse> {
  // Require auth to avoid exposing store listing
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  try {
    const { blobs, cursor } = await list()
    return NextResponse.json({ count: blobs.length, cursor, blobs })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'List error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



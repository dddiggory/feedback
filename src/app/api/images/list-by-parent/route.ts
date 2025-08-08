import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')
  const parentId = searchParams.get('parentId')
  if (!scope || !parentId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const column = scope === 'entry' ? 'entry_id' : 'feedback_item_id'

  const { data, error } = await supabase
    .from('images')
    .select('id, url, caption')
    .eq(column, parentId)
    .is('deleted_at', null)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to list' }, { status: 500 })

  return NextResponse.json({ images: data || [] })
}



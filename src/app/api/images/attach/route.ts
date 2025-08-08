import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Attach a completed upload to either a feedback item or an entry
// Expects JSON body: { scope: 'feedback_item' | 'entry', parentId: string, blob: { url, size, contentType, ... }, width?, height? }

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { scope, parentId, blob, width, height, caption } = body as {
      scope: 'feedback_item' | 'entry'
      parentId: string
      blob: { url: string; size: number; contentType: string }
      width?: number | null
      height?: number | null
      caption?: string | null
    }

    if (!scope || !parentId || !blob?.url || !blob?.contentType || !blob?.size) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const isFeedback = scope === 'feedback_item'
    const fkColumn = isFeedback ? 'feedback_item_id' : 'entry_id'

    // Enforce max 10 active images at app layer too (DB trigger also enforces)
    const { count } = await supabase
      .from('images')
      .select('id', { count: 'exact', head: true })
      .eq(fkColumn, parentId)
      .is('deleted_at', null)

    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: 'Max 10 images reached for this item' }, { status: 400 })
    }

    // Insert
    const { data, error } = await supabase
      .from('images')
      .insert({
        [fkColumn]: parentId,
        created_by_user_id: user.id,
        url: blob.url,
        content_type: blob.contentType,
        size_bytes: blob.size,
        width: width ?? null,
        height: height ?? null,
        caption: caption ?? null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Attach image insert error:', error)
      return NextResponse.json({ error: 'Failed to attach image' }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: data })
  } catch (error) {
    console.error('Attach image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



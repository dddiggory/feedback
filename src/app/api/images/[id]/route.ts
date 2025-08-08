import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { del } from '@vercel/blob'
import { isAdminUser } from '@/config/admin'

// Soft-delete by default; if query ?purge=1, also delete the blob immediately
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const purge = new URL(request.url).searchParams.get('purge') === '1'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Load the image row
    const { data: image, error: fetchErr } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !image) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Authorization: owner or admin. Admins are checked in app routes; here we allow owner.
    // If you want strict admin for feedback_item images, do a lookup of the parent and check.
    if (image.created_by_user_id !== user.id && !isAdminUser(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete first
    const { error: softErr } = await supabase
      .from('images')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (softErr) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    if (purge) {
      try {
        await del(image.url)
      } catch (e) {
        // Ignore purge errors; the row is already soft-deleted
        console.warn('Blob purge failed:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



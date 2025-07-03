import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/config/admin'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check admin permissions
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: 'Admin permissions required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Update the feedback item
    const { data, error } = await supabase
      .from('product_feedback_items')
      .update({ 
        title: title.trim(),
        description: description.trim(),
        slug,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('slug')
      .single()

    if (error) {
      console.error('Error updating feedback item:', error)
      return NextResponse.json({ error: 'Failed to update feedback item' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      slug: data.slug,
      message: 'Feedback item updated successfully'
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 })
  }
} 
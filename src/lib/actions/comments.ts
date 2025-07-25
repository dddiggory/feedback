'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminUser } from '@/config/admin'

export interface Comment {
  id: string
  feedback_item_id: string
  created_by_user_id: string
  body: string
  created_at: string
  updated_at: string
  pinned: string | null
  commenter_name: string | null
  commenter_avatar: string | null
  commenter_email: string | null
}

export async function createComment(
  feedbackItemId: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    // Get avatar from user_metadata (Google OAuth) or profile table
    const avatarUrl = user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture || 
                     profile?.avatar_url || 
                     null

    // Insert comment
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        feedback_item_id: feedbackItemId,
        created_by_user_id: user.id,
        body: body.trim(),
        commenter_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        commenter_avatar: avatarUrl,
        commenter_email: user.email
      })

    if (insertError) {
      console.error('Error creating comment:', insertError)
      return { success: false, error: 'Failed to create comment' }
    }

    // Revalidate the page to show the new comment
    revalidatePath('/feedback/[slug]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error in createComment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Delete comment (only if user owns it)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('created_by_user_id', user.id) // Ensure user can only delete their own comments

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return { success: false, error: 'Failed to delete comment' }
    }

    // Revalidate the page to show the updated comments
    revalidatePath('/feedback/[slug]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error in deleteComment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function pinComment(
  commentId: string,
  feedbackItemId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if user is admin
    if (!isAdminUser(user)) {
      return { success: false, error: 'Admin permissions required' }
    }
    
    // First, unpin any existing pinned comment for this feedback item
    const { error: unpinError } = await supabase
      .from('comments')
      .update({ pinned: null })
      .eq('feedback_item_id', feedbackItemId)
      .not('pinned', 'is', null)

    if (unpinError) {
      console.error('Error unpinning existing comment:', unpinError)
      return { success: false, error: 'Failed to unpin existing comment' }
    }

    // Pin the selected comment
    const { error: pinError } = await supabase
      .from('comments')
      .update({ pinned: new Date().toISOString() })
      .eq('id', commentId)

    if (pinError) {
      console.error('Error pinning comment:', pinError)
      return { success: false, error: 'Failed to pin comment' }
    }

    // Revalidate the page to show the updated comments
    revalidatePath('/feedback/[slug]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error in pinComment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function unpinComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if user is admin
    if (!isAdminUser(user)) {
      return { success: false, error: 'Admin permissions required' }
    }
    
    // Unpin the comment
    const { error: unpinError } = await supabase
      .from('comments')
      .update({ pinned: null })
      .eq('id', commentId)

    if (unpinError) {
      console.error('Error unpinning comment:', unpinError)
      return { success: false, error: 'Failed to unpin comment' }
    }

    // Revalidate the page to show the updated comments
    revalidatePath('/feedback/[slug]', 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error in unpinComment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getComments(feedbackItemId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient()
    
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('feedback_item_id', feedbackItemId)
      .order('pinned', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    return comments || []
  } catch (error) {
    console.error('Error in getComments:', error)
    return []
  }
} 
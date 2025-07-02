'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Comment {
  id: string
  feedback_item_id: string
  created_by_user_id: string
  body: string
  created_at: string
  updated_at: string
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

    // Insert comment
    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        feedback_item_id: feedbackItemId,
        created_by_user_id: user.id,
        body: body.trim(),
        commenter_name: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
        commenter_avatar: profile?.avatar_url || null,
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

export async function getComments(feedbackItemId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient()
    
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('feedback_item_id', feedbackItemId)
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
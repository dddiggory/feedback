'use server'

import { createClient } from '@/lib/supabase/server'

export interface GTMFeedbackPayload {
  feedback_item_title: string;
  entry_description: string;
  account_name: string;
  current_arr: number;
  open_opp_arr: number;
  submitter_name: string;
  product_area_slugs: string[];
  feedback_item_url?: string;
  account_url?: string;
  feedback_entry_url?: string;
}

interface CreateEntryWithWebhookData {
  feedbackItemId: string;
  accountName: string;
  severity: string;
  description: string;
  links: string;
  currentArr: number | null;
  openOppArr: number | null;
  sfdcAccount: string | null;
  companyWebsite: string | null;
}

export async function createEntryWithWebhook(
  data: CreateEntryWithWebhookData
): Promise<{ success: boolean; error?: string; entryId?: string }> {
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

    // Extract user name (same pattern as comments)
    const submitterName = profile?.full_name || 
                         user.user_metadata?.full_name || 
                         user.email?.split('@')[0] || 
                         'Anonymous'

    // Clean up company website before storing in database
    const cleanWebsite = data.companyWebsite 
      ? data.companyWebsite
          .replace(/^https?:\/\//, '') // Remove protocol
          .replace(/^www\./, '')       // Remove www prefix
          .replace(/\/$/, '')          // Remove trailing slash
          .split('/')[0]               // Remove path - keep only domain
          .toLowerCase()               // Ensure lowercase
      : null;

    // Insert the entry (let database generate entry_key)
    const { data: entry, error: insertError } = await supabase
      .from('entries')
      .insert({
        feedback_item_id: data.feedbackItemId,
        account_name: data.accountName,
        severity: data.severity,
        entry_description: data.description,
        external_links: data.links || null,
        open_opp_arr: data.openOppArr,
        current_arr: data.currentArr,
        sfdc_account: data.sfdcAccount,
        company_website: cleanWebsite,
        created_by_user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating entry:', insertError)
      return { success: false, error: 'Failed to create feedback entry' }
    }

    // Fetch the entry with the generated entry_key from entries_with_data view
    const { data: entryWithKey, error: entryFetchError } = await supabase
      .from('entries_with_data')
      .select('entry_key')
      .eq('id', entry.id)
      .single()

    if (entryFetchError || !entryWithKey?.entry_key) {
      console.error('Error fetching entry_key:', entryFetchError)
      // Don't fail the entry creation, just log the webhook failure
      console.warn('Webhook will not be sent due to missing entry_key')
      return { success: true, entryId: entry.id }
    }

    // Fetch feedback item details for webhook payload
    const { data: feedbackItem, error: feedbackError } = await supabase
      .from('feedback_items_with_data')
      .select('title, slug, product_area_slugs')
      .eq('id', data.feedbackItemId)
      .single()

    if (feedbackError) {
      console.error('Error fetching feedback item:', feedbackError)
      // Don't fail the entry creation, just log the webhook failure
      console.warn('Webhook will not be sent due to missing feedback item data')
      return { success: true, entryId: entry.id }
    }

    // Prepare webhook payload (using already cleaned website)
    const webhookPayload: GTMFeedbackPayload = {
      feedback_item_title: feedbackItem.title,
      entry_description: data.description,
      account_name: data.accountName,
      current_arr: data.currentArr ?? 0,
      open_opp_arr: data.openOppArr ?? 0,
      submitter_name: submitterName,
      product_area_slugs: feedbackItem.product_area_slugs || [],
      feedback_item_url: `https://gtmfeedback.vercel.app/feedback/${feedbackItem.slug}`,
      account_url: cleanWebsite ? `https://gtmfeedback.vercel.app/accounts/${cleanWebsite}` : undefined,
      feedback_entry_url: `https://gtmfeedback.vercel.app/feedback/${feedbackItem.slug}/entries/${entryWithKey.entry_key}`
    }

    // Send webhook (fire and forget - don't fail entry creation if webhook fails)
    try {
      const webhookResponse = await fetch(
        'https://feedback.vercel.sh/api/gtm-feedback',
        // 'https://webhook.site/8d47997a-74c0-44d4-8a13-b622e8388d29',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': 'W0RewZTMB7NyfVjvkCmk2nAFqrlQvxi2',
          },
          body: JSON.stringify(webhookPayload),
        }
      )

      if (!webhookResponse.ok) {
        // Get the response body for more detailed error information
        let errorBody = '';
        try {
          errorBody = await webhookResponse.text();
        } catch {
          errorBody = 'Could not read response body';
        }
        
        console.error('Webhook failed:', {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          responseBody: errorBody,
          requestPayload: webhookPayload
        });
        // Log but don't fail the entry creation
      } else {
        console.log('Webhook sent successfully')
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError)
      // Log but don't fail the entry creation
    }

    return { success: true, entryId: entry.id }
  } catch (error) {
    console.error('Error in createEntryWithWebhook:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
} 
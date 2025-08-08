import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { createClient } from '@/lib/supabase/server'

// Client upload token endpoint
// - Authenticates user via Supabase
// - Restricts content types
// - Applies addRandomSuffix and optional cache policy
// Note: We are not using onUploadCompleted in dev to avoid localhost webhook issues.

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  // Authenticate
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Optional: inspect clientPayload to apply additional authorization
        // e.g., ensure scope is valid and the IDs look correct UUIDs
        const allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp']
        // Enforce directory prefixes by scope
        let prefix = ''
        if (clientPayload && typeof clientPayload === 'object') {
          const { scope, parentId } = clientPayload as any
          if (scope === 'feedback_item' && typeof parentId === 'string') {
            prefix = `feedback_items/${parentId}/`
          }
          if (scope === 'entry' && typeof parentId === 'string') {
            prefix = `feedback_entries/${parentId}/`
          }
        }

        // If a prefix is set, ensure the requested pathname starts with it
        if (prefix && !pathname.startsWith(prefix)) {
          throw new Error('Invalid upload path')
        }

        return {
          allowedContentTypes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: user.id,
            clientPayload: clientPayload ?? null,
          }),
          // cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days, optional
        }
      },
      // We avoid writing to DB here because localhost callbacks from Blob won't work.
      // The client will call a separate attach endpoint after upload completes.
      onUploadCompleted: async () => {
        // no-op; handled client-side via /api/images/attach
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload token error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}



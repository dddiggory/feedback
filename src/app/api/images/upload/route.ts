import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { createClient } from '@/lib/supabase/server'

type UploadClientPayload = {
  scope: 'feedback_item' | 'entry'
  parentId: string
  filename?: string
}

function isUploadClientPayload(value: unknown): value is UploadClientPayload {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  const hasValidScope = obj.scope === 'feedback_item' || obj.scope === 'entry'
  const hasValidParentId = typeof obj.parentId === 'string'
  const hasValidFilename = obj.filename === undefined || typeof obj.filename === 'string'
  return hasValidScope && hasValidParentId && hasValidFilename
}

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
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Optional: inspect clientPayload to apply additional authorization
        // e.g., ensure scope is valid and the IDs look correct UUIDs
        const allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp']
        // Generate a pathname on the server to ensure correct subdirectory usage
        let pathname = 'misc/'
        if (isUploadClientPayload(clientPayload)) {
          const { scope, parentId, filename } = clientPayload
          if (scope === 'feedback_item') {
            pathname = `feedback_items/${parentId}/${filename || 'image'}`
          } else if (scope === 'entry') {
            pathname = `feedback_entries/${parentId}/${filename || 'image'}`
          }
        }

        return {
          allowedContentTypes,
          addRandomSuffix: true,
          pathname,
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



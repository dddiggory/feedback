"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Layout } from '@/components/layout/Layout'
import { ProductAreaSelect } from '@/components/feedback/ProductAreaSelect'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'

// Minimal shape used from the upload response
type BlobUploadResult = {
  url: string
}

export default function NewFeedbackPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProductAreas, setSelectedProductAreas] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploaded, setUploaded] = useState<BlobUploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Add keyboard shortcut for cmd+enter to submit form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isSubmitting && title.trim() && description.trim()) {
          const form = document.querySelector('form') as HTMLFormElement
          if (form) {
            form.requestSubmit()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, title, description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // 1. Insert feedback item
      const { data: item, error } = await supabase
        .from('product_feedback_items')
        .insert({
          title,
          description,
          slug,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Insert into join table for each selected product area
      if (item && selectedProductAreas.length > 0) {
        const joinRows = selectedProductAreas.map((area) => ({
          feedback_item_id: item.id,
          product_area_id: area.value, // area.value is the product_area_id (uuid)
        }))
        console.log('Join table payload:', joinRows)
        const { error: joinError } = await supabase.from('items_to_areas').insert(joinRows)
        if (joinError) throw joinError
      }

      // If images were selected, upload then attach to the created feedback item
      if (item && pendingFiles.length > 0) {
        try {
          setUploading(true)
          const results: BlobUploadResult[] = []
          for (const file of pendingFiles) {
            const res = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/images/upload',
              // send scope so server route can build the pathname
              clientPayload: JSON.stringify({ scope: 'feedback_item', parentId: item.id, filename: file.name }),
            })
            results.push(res)
            console.log('Uploaded to Blob:', res.url)
            // Attach in DB
            const attachResp = await fetch('/api/images/attach', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                scope: 'feedback_item',
                parentId: item.id,
                blob: {
                  url: res.url,
                  // The Vercel Blob response does not include size/contentType; fall back to the File values
                  size: file.size,
                  contentType: file.type,
                },
              }),
            })
            if (!attachResp.ok) {
              const t = await attachResp.text()
              console.error('Attach failed:', attachResp.status, t)
            }
          }
          setUploaded(results)
        } catch (err) {
          console.error('Image upload/attach error:', err)
        } finally {
          setUploading(false)
        }
      }

      // Redirect to the new feedback item
      router.push(`/feedback/${slug}`)
    } catch (error) {
      console.error('Error creating feedback item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const MAX_IMAGES = 10
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const existing = pendingFiles.length
    const added: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!ACCEPTED.includes(f.type)) continue
      if (existing + added.length >= MAX_IMAGES) break
      added.push(f)
    }
    if (added.length) setPendingFiles(prev => [...prev, ...added])
  }, [pendingFiles.length])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const onClickPicker = () => fileInputRef.current?.click()

  const removePending = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Create New Feedback Item</h1>
          <p className="text-slate-300 mt-2">
            Most of the time, you should add your customer&apos;s +1 to an existing feedback item, to help build a case for that request. However, if you&apos;re certain that you have a brand new type of feedback that hasn&apos;t been requested by anyone else before, you can use this form to create a new one.
          </p>

          <p className="mt-5 p-4 bg-yellow-50 rounded-md text-sm">
            <span className="font-bold">Please note!</span> This is the creation of a general &lsquo;container&rsquo; or description of the request. You can add a customer-specific &ldquo;entry&rdquo; on the next step.
            <br />
            <br />
            ✅ &ldquo;Productized Bot Protection&rdquo;
            <br />
            ❌ &ldquo;DoorDash needs Bot Protection&rdquo; (You&apos;ll do this on the next step)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (General description, NOT customer-specific)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title for the request"
              required
              autoFocus
              style={{backgroundColor: 'rgb(248 250 252)'}}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-area">Product Area(s)</Label>
            <div style={{backgroundColor: 'rgb(248 250 252)'}}>
              <ProductAreaSelect value={selectedProductAreas} onChange={setSelectedProductAreas} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">General Description (NOT customer-specific)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the pain point in a general, customer-agnostic way. You can provide a customer-specific anecdote on the next step. Generally, focus on the problem and the pain rather than prescribing a specific solution."
              className="min-h-[120px]"
              style={{backgroundColor: 'rgb(248 250 252)'}}
              required
            />
          </div>

          {/* Image uploader */}
          <div className="space-y-2">
            <Label>Images (optional)</Label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={onClickPicker}
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer bg-white/60 hover:bg-white"
            >
              <p className="text-slate-700">Drag and drop images here, or click to browse</p>
              <p className="text-slate-500 text-sm mt-1">Up to {MAX_IMAGES} images. JPEG, PNG, WEBP.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {pendingFiles.length > 0 && (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2">
                    <div className="truncate text-sm text-slate-700">{f.name}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePending(i)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}
            {uploading && <div className="text-sm text-slate-600">Uploading images…</div>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || uploading || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Feedback Item (⌘+Enter)'}
          </Button>
        </form>
      </div>
    </Layout>
  )
} 
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { upload } from '@vercel/blob/client'

type ImageRow = {
  id: string
  url: string
  caption: string | null
}

interface Props {
  entryId: string
  initialImages: ImageRow[]
}

export function EntryImagesManagerModal({ entryId, initialImages }: Props) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<ImageRow[]>(initialImages)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

  const refreshImages = useCallback(async () => {
    try {
      const resp = await fetch(`/api/images/list-by-parent?scope=entry&parentId=${entryId}`)
      if (resp.ok) {
        const data = await resp.json()
        setImages(data.images || [])
      }
    } catch {}
  }, [entryId])

  useEffect(() => {
    const handler = () => {
      setOpen(true)
      // Fetch latest images when opening
      refreshImages()
    }
    window.addEventListener('open-entry-images-modal', handler)
    return () => window.removeEventListener('open-entry-images-modal', handler)
  }, [refreshImages])

  // Also refresh whenever the modal becomes open (e.g., after first render)
  useEffect(() => {
    if (open) void refreshImages()
  }, [open, refreshImages])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!ACCEPTED.includes(f.type)) continue
      added.push(f)
    }
    if (added.length) setPendingFiles(prev => [...prev, ...added])
  }

  const handleUpload = async () => {
    if (!pendingFiles.length) return
    setUploading(true)
    try {
      for (const file of pendingFiles) {
        const res = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/images/upload',
          clientPayload: JSON.stringify({
            scope: 'entry',
            parentId: entryId,
            filename: file.name,
          }),
        })
        await fetch('/api/images/attach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: 'entry',
            parentId: entryId,
            blob: {
              url: res.url,
              size: file.size,
              contentType: file.type,
            },
          }),
        })
      }
      setPendingFiles([])
      await refreshImages()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    const resp = await fetch(`/api/images/${imageId}`, { method: 'DELETE' })
    if (resp.ok) setImages(prev => prev.filter(i => i.id !== imageId))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Entry Images</DialogTitle>
        </DialogHeader>

        {/* Current images */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative border rounded-md bg-white">
              <img src={img.url} alt={img.caption || 'image'} className="w-full h-28 object-contain rounded-md" />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded p-1 cursor-pointer"
                aria-label="Delete image"
                title="Delete image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-3 text-sm text-slate-600">No images yet.</div>
          )}
        </div>

        {/* Upload pad */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer bg-white/70 hover:bg-white"
        >
          <p className="text-slate-700">Drag and drop images here, or click to browse</p>
          <p className="text-slate-500 text-sm mt-1">JPEG, PNG, WEBP</p>
          <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>

        {pendingFiles.length > 0 && (
          <div className="mt-3 text-sm text-slate-700">
            Ready to upload: {pendingFiles.map(f => f.name).join(', ')}
          </div>
        )}

        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button className="cursor-pointer" onClick={handleUpload} disabled={uploading || pendingFiles.length === 0}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

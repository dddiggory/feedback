"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function ImageLightbox() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { url: string; caption?: string | null }
      setUrl(detail.url)
      setCaption(detail.caption ?? null)
      setOpen(true)
    }
    window.addEventListener('open-image-lightbox', handler as EventListener)
    return () => window.removeEventListener('open-image-lightbox', handler as EventListener)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] xl:max-w-[95vw] bg-slate-900 p-2 sm:p-3">
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        {url && (
          <div className="flex flex-col items-center gap-3">
            <img src={url} alt={caption || 'Image'} className="max-h-[90vh] max-w-[92vw] h-auto w-auto object-contain rounded-md" />
            {caption && <div className="text-white/80 text-sm">{caption}</div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}



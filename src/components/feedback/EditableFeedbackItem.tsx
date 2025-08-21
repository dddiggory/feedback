"use client"

import { useState } from 'react'
import { PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EditableFeedbackItemProps {
  feedbackItem: {
    id: string
    title: string
    description: string
    slug: string
    status: string
    shipped_notes?: string | null
  }
  images?: Array<{
    id: string
    url: string
    caption: string | null
    width: number | null
    height: number | null
  }>
}

export function EditableFeedbackItem({ feedbackItem, images = [] }: EditableFeedbackItemProps) {
  const { isAdmin } = useAdmin()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(feedbackItem.title)
  const [editedDescription, setEditedDescription] = useState(feedbackItem.description)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [shippingNotes, setShippingNotes] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
    setEditedTitle(feedbackItem.title)
    setEditedDescription(feedbackItem.description)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedTitle(feedbackItem.title)
    setEditedDescription(feedbackItem.description)
    setError(null)
  }

  const handleSave = async () => {
    if (!editedTitle.trim() || !editedDescription.trim()) {
      setError('Title and description cannot be empty')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/feedback/${feedbackItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle.trim(),
          description: editedDescription.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update feedback item')
      }

      // If the slug changed, navigate to the new URL
      if (data.slug !== feedbackItem.slug) {
        router.push(`/feedback/${data.slug}`)
      } else {
        // If slug didn't change, just refresh the page to show updated data
        window.location.reload()
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error updating feedback item:', error)
      setError(error instanceof Error ? error.message : 'Failed to update feedback item')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string, shippedNotes?: string) => {
    setIsUpdatingStatus(true)
    setError(null)

    try {
      const response = await fetch(`/api/feedback/${feedbackItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          shipped_notes: shippedNotes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update feedback item status')
      }

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error updating feedback item status:', error)
      setError(error instanceof Error ? error.message : 'Failed to update feedback item status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleShippingModalSubmit = () => {
    if (!shippingNotes.trim()) {
      setError('Please provide shipping notes before marking as shipped')
      return
    }
    
    setShowShippingModal(false)
    handleStatusChange('shipped', shippingNotes.trim())
    setShippingNotes('')
  }

  const handleShippingModalCancel = () => {
    setShowShippingModal(false)
    setShippingNotes('')
    setError(null)
  }

  const handleMarkAsOpen = () => {
    handleStatusChange('open')
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4 pr-4 h-full">
        <div className="flex items-center gap-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="font-bold text-slate-100 bg-slate-800/50 border-slate-600 text-4xl h-auto py-2"
            placeholder="Enter feedback item title..."
            autoFocus
          />
        </div>

        {/* Description with persistent image strip */}
        <div className="relative flex-1 min-h-[160px]">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-slate-950 bg-slate-100/80 border-slate-300 h-full resize-none pr-4"
            placeholder="Enter feedback item description..."
            style={{ paddingBottom: 60 }}
          />
          <div className="absolute bottom-1 left-1 right-1 bg-white/80 border border-slate-200 rounded-md px-2 py-1.5 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2">
              {images.slice(0, 10).map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt={img.caption || 'Image'}
                    className="h-9 w-auto max-w-[72px] object-contain rounded border border-slate-200 bg-white"
                  />
                  <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <img src={img.url} alt="preview" className="h-28 w-28 object-cover rounded-md shadow-lg border" />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                className="ml-auto bg-teal-600/90 hover:bg-teal-700 text-white cursor-pointer"
                onClick={() => {
                  const evt = new CustomEvent('open-images-modal', { detail: { feedbackItemId: feedbackItem.id } })
                  window.dispatchEvent(evt)
                }}
              >
                Add / Edit Explanatory Images
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isSaving}
            variant="outline"
            className="text-slate-800 border-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <XMarkIcon className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pr-4 h-full">
      <div className="flex items-start gap-2">
        <h1 className={`font-bold text-slate-100 text-shadow-lg ${feedbackItem.title.length > 50 ? 'text-4xl' : 'text-5xl'}`}>
          {feedbackItem.title}
        </h1>
        
        <div className="flex flex-col gap-1 ml-2">
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="sm"
            className="cursor-pointer h-8 w-fit px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md justify-start"
            title="Edit title and description"
          >
            <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit Item Description
          </Button>

          {/* Admin Status Control Buttons */}
          {isAdmin && (
            <>
              {feedbackItem.status === 'shipped' ? (
                <Button
                  onClick={handleMarkAsOpen}
                  disabled={isUpdatingStatus}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer h-8 w-fit px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md justify-start disabled:opacity-50"
                  title="Mark as open"
                >
                  <span className="mr-1">🔄</span> Mark as Open
                </Button>
              ) : (
                <Button
                  onClick={() => setShowShippingModal(true)}
                  disabled={isUpdatingStatus}
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer h-8 w-fit px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md justify-start disabled:opacity-50"
                  title="Mark as shipped"
                >
                  <span className="mr-1">🚢</span> Mark as Shipped
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
      
      <div className="relative flex-1 min-h-[160px]">
        <p className="text-slate-950 overflow-y-auto h-full p-4 wrap-normal bg-slate-100/80 rounded-lg pr-4"
           style={{ paddingBottom: images.length > 0 ? 52 : undefined }}>
          {feedbackItem.description}
        </p>
        {images.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1 bg-white/80 border border-slate-200 rounded-md px-2 py-1.5 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2">
              {images.slice(0, 10).map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt={img.caption || 'Image'}
                    className="h-9 w-auto max-w-[72px] object-contain rounded border border-slate-200 cursor-zoom-in bg-white"
                    onClick={() => {
                      const evt = new CustomEvent('open-image-lightbox', { detail: { url: img.url, caption: img.caption } })
                      window.dispatchEvent(evt)
                    }}
                  />
                  <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <img src={img.url} alt="preview" className="h-28 w-28 object-cover rounded-md shadow-lg border" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shipping Modal */}
      <Dialog open={showShippingModal} onOpenChange={setShowShippingModal}>
        <DialogContent className="bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Mark as Shipped</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-3">
                If this item is shipped, you can update it here. Please enter some brief notes describing 
                the ship and, ideally, linking to an external reference like:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>A blog post</li>
                <li>Launch Calendar notion doc</li>
                <li>A Slack post (ideally not, due to Slack retention restrictions, but if necessary)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="shipping-notes" className="block text-sm font-medium text-gray-700">
                Shipping Notes *
              </label>
              <Textarea
                id="shipping-notes"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                placeholder="e.g., Shipped Aug 20 2025 - see launch blog post: https://vercel.com/blog/feature-launch"
                className="min-h-[120px] resize-none"
                disabled={isUpdatingStatus}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleShippingModalCancel}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShippingModalSubmit}
                disabled={isUpdatingStatus || !shippingNotes.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUpdatingStatus ? 'Updating...' : '🚢 Mark as Shipped'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
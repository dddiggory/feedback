"use client"

import { useState } from 'react'
import { PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface EditableFeedbackItemProps {
  feedbackItem: {
    id: string
    title: string
    description: string
    slug: string
  }
}

export function EditableFeedbackItem({ feedbackItem }: EditableFeedbackItemProps) {
  const { isAdmin } = useAdmin()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(feedbackItem.title)
  const [editedDescription, setEditedDescription] = useState(feedbackItem.description)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        
        <Textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="text-slate-950 bg-slate-100/80 border-slate-300 flex-1 min-h-[120px] resize-none"
          placeholder="Enter feedback item description..."
        />
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
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
            className="text-slate-800 border-slate-400 hover:bg-slate-100"
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
      <div className="flex items-center gap-2">
        <h1 className={`font-bold text-slate-100 text-shadow-lg ${feedbackItem.title.length > 50 ? 'text-4xl' : 'text-5xl'}`}>
          {feedbackItem.title}
        </h1>
        
        {isAdmin && (
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="sm"
            className="ml-2 h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md"
            title="Edit title and description"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <p className="text-slate-950 overflow-y-auto p-4 wrap-normal bg-slate-100/80 rounded-lg flex-1">
        {feedbackItem.description}
      </p>
    </div>
  )
} 
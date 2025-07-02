'use client'

import { useState, useTransition } from 'react'
import { createComment, deleteComment, pinComment, unpinComment, type Comment } from '@/lib/actions/comments'
import { useAdmin } from '@/hooks/use-admin'
import { Pin, PinOff } from 'lucide-react'

interface CommentsProps {
  feedbackItemId: string;
  initialComments?: Comment[];
  currentUserId?: string;
}

export function Comments({ feedbackItemId, initialComments = [], currentUserId }: CommentsProps) {
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const { isAdmin } = useAdmin()

  const submitComment = async () => {
    if (!comment.trim() || isPending) return

    startTransition(async () => {
      const result = await createComment(feedbackItemId, comment)
      if (result.success) {
        setComment('')
      } else {
        // Handle error (you could add toast notifications here)
        console.error('Failed to create comment:', result.error)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitComment()
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete your comment?')) {
      return
    }

    startTransition(async () => {
      const result = await deleteComment(commentId)
      if (!result.success) {
        console.error('Failed to delete comment:', result.error)
      }
    })
  }

  const handlePin = async (commentId: string) => {
    startTransition(async () => {
      const result = await pinComment(commentId, feedbackItemId)
      if (!result.success) {
        console.error('Failed to pin comment:', result.error)
      }
    })
  }

  const handleUnpin = async (commentId: string) => {
    startTransition(async () => {
      const result = await unpinComment(commentId)
      if (!result.success) {
        console.error('Failed to unpin comment:', result.error)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (comment.trim() && !isPending) {
        submitComment()
      }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="pt-1 pb-1 bg-slate-50/90 rounded-lg border-l-4 border-blue-400 h-full flex flex-col">
      <h4 className="pl-4 text-slate-500 font-semibold text-xs mb-0.5">Comments</h4>
      
      <div className="px-4 flex-1 flex flex-col justify-between min-h-0">
        {/* Comments List */}
        <div className="flex-1 overflow-y-auto mb-2 min-h-0">
          {initialComments.length === 0 ? (
            <p className="text-slate-600 text-sm">No comments yet...</p>
          ) : (
            <div className="space-y-3">
              {initialComments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`flex gap-2 group ${
                    comment.pinned 
                      ? 'bg-amber-50 border border-amber-200 rounded-lg p-3 relative' 
                      : ''
                  }`}
                >
                  {/* Pinned indicator */}
                  {comment.pinned && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <Pin className="w-3 h-3" />
                      <span>Pinned</span>
                    </div>
                  )}
                  
                  {/* Avatar */}
                  {comment.commenter_avatar ? (
                    <img 
                      src={comment.commenter_avatar} 
                      alt={`${comment.commenter_name}'s avatar`}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {comment.commenter_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  
                  {/* Comment Content */}
                  <div className="flex-1 min-w-0 relative">
                    <p className={`text-sm text-slate-600 break-words ${comment.pinned ? 'pr-16' : ''}`}>
                      <span className="font-medium text-slate-700">
                        {comment.commenter_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-slate-500 mx-2">
                        {formatTimestamp(comment.created_at)}
                      </span>
                      {comment.body}
                    </p>
                    
                    {/* Action buttons container */}
                    <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Admin-only Pin/Unpin Button */}
                      {isAdmin && (
                        <button
                          onClick={() => comment.pinned ? handleUnpin(comment.id) : handlePin(comment.id)}
                          disabled={isPending}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer ${
                            comment.pinned
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700'
                          }`}
                          title={comment.pinned ? 'Unpin comment' : 'Pin comment'}
                        >
                          {comment.pinned ? (
                            <PinOff className="w-3 h-3" />
                          ) : (
                            <Pin className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      
                      {/* Delete Button - only show for current user's comments */}
                      {currentUserId === comment.created_by_user_id && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="w-5 h-5 rounded bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                          title="Delete comment"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916C16.5 2.61 14.6.75 12.75.75S9 2.61 9 3.5v.916m4.5 0a2.447 2.447 0 0 0-4.5 0M19.5 3h-15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add your thoughts..."
            className="w-full px-3 py-2 pr-20 text-sm border border-gray-200 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
            rows={2}
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={!comment.trim() || isPending}
            className="absolute bottom-3 right-2 inline-flex items-center gap-x-1 rounded-md bg-gradient-to-r from-blue-100 to-blue-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:shadow-md hover:from-blue-200 hover:to-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.896 28.896 0 003.105 2.289z" />
            </svg>
            {isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 
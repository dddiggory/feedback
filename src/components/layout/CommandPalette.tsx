"use client"

import { useState, useEffect, useCallback } from 'react'
import { FeedbackSearchBox } from '@/components/feedback/FeedbackSearchBox'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSelect = useCallback((option: { slug?: string } | null) => {
    if (option?.slug) {
      // Close the modal when an option is selected
      setIsOpen(false)
    }
  }, [])

  const handleCreateNew = useCallback(() => {
    // Close the modal when "Create new" is clicked
    setIsOpen(false)
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for cmd+k (Mac) or ctrl+k (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleOpen()
      }
      // Close with Escape key
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleOpen, handleClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16"
      onClick={handleOverlayClick}
    >
      <div className="w-[70vw] max-w-6xl">
        <div className="animated-gradient-bg">
          <div className="p-4">
            <FeedbackSearchBox 
              onSelect={handleSelect}
              onCreateNew={handleCreateNew}
              placeholder="Search feedback items... (Press Esc to close)"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect, useCallback } from 'react'
import { FeedbackSearchBox } from '@/components/feedback/FeedbackSearchBox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="w-[70vw] max-w-6xl sm:max-w-6xl md:max-w-6xl lg:max-w-6xl xl:max-w-6xl p-0 bg-transparent border-none shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search Feedback Items</DialogTitle>
        <div className="w-full">
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
      </DialogContent>
    </Dialog>
  )
} 
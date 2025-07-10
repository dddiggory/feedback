"use client"

import { useEffect, useState } from 'react'

export function KeyboardShortcutHint() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'))
  }, [])

  return (
    <div className="text-center mt-2">
      <p className="text-xs text-white">
        Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
          {isMac ? '⌘ K' : 'Ctrl K'}
        </kbd> to open search from anywhere
      </p>
    </div>
  )
} 
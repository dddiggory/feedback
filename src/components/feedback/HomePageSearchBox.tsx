"use client"

import { useRef, useEffect } from 'react'
import { FeedbackSearchBox, type FeedbackSearchBoxRef } from './FeedbackSearchBox'

// Global ref to access the search box from anywhere
let globalSearchBoxRef: FeedbackSearchBoxRef | null = null

export function getHomePageSearchBoxRef(): FeedbackSearchBoxRef | null {
  return globalSearchBoxRef
}

export function HomePageSearchBox() {
  const searchBoxRef = useRef<FeedbackSearchBoxRef>(null)

  useEffect(() => {
    globalSearchBoxRef = searchBoxRef.current
    
    // Cleanup on unmount
    return () => {
      globalSearchBoxRef = null
    }
  }, [])

  return <FeedbackSearchBox ref={searchBoxRef} />
} 
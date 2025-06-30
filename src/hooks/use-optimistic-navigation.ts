'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useCallback, useState } from 'react'

interface UseOptimisticNavigationOptions {
  // Whether to show loading state during navigation
  showLoading?: boolean
  // Callback to execute before navigation
  onBeforeNavigate?: () => void
  // Callback to execute after navigation completes
  onAfterNavigate?: () => void
}

export function useOptimisticNavigation(options: UseOptimisticNavigationOptions = {}) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  
  const {
    showLoading = false,
    onBeforeNavigate,
    onAfterNavigate
  } = options

  const navigate = useCallback((href: string, options?: { replace?: boolean }) => {
    // Execute pre-navigation callback
    onBeforeNavigate?.()
    
    if (showLoading) {
      setIsNavigating(true)
    }

    // Use startTransition for non-blocking navigation
    startTransition(() => {
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
    })

    // Reset loading state after a brief delay
    if (showLoading) {
      setTimeout(() => {
        setIsNavigating(false)
        onAfterNavigate?.()
      }, 100)
    } else {
      onAfterNavigate?.()
    }
  }, [router, showLoading, onBeforeNavigate, onAfterNavigate])

  const preload = useCallback((href: string) => {
    // Preload the route for instant navigation
    router.prefetch(href)
  }, [router])

  return {
    navigate,
    preload,
    isNavigating,
    // Convenience methods
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
  }
} 
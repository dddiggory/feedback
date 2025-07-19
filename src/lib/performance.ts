/**
 * Performance optimization utilities
 */

import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Memoized component wrapper for expensive operations
 */
export function withMemoization<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  displayName?: string
): React.ComponentType<T> {
  const MemoizedComponent = React.memo(Component)
  if (displayName) {
    MemoizedComponent.displayName = displayName
  }
  return MemoizedComponent
}

/**
 * Hook for stable references to prevent unnecessary re-renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const ref = useRef<T>(callback)
  ref.current = callback
  
  return useCallback(((...args: unknown[]) => ref.current(...args)) as T, [])
}

/**
 * Hook for expensive computations with dependency tracking
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    const start = performance.now()
    const result = factory()
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development' && end - start > 16) {
      console.warn(`Expensive computation took ${end - start}ms`)
    }
    
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory, ...deps])
}

/**
 * Virtual scrolling utilities for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  itemCount: number
  overscan?: number
}

export function calculateVirtualScrollRange({
  scrollTop,
  itemHeight,
  containerHeight,
  itemCount,
  overscan = 5
}: VirtualScrollOptions & { scrollTop: number }) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  return { startIndex, endIndex }
}
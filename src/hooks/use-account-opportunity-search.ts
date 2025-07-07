import { useState, useEffect, useCallback } from 'react'
import { useDebouncedCallback } from './use-debounced-callback'
import useSWR from 'swr'

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch accounts')
  }
  return data.accounts
}

export function useAccountSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [lastSearchedTerm, setLastSearchedTerm] = useState('')

  // Debounced search term
  const debouncedSetSearchTerm = useDebouncedCallback(
    (term: string) => {
      setDebouncedSearchTerm(term)
    },
    300
  )

  // Update debounced term when search term changes
  useEffect(() => {
    debouncedSetSearchTerm(searchTerm)
  }, [searchTerm, debouncedSetSearchTerm])

  // SWR hook for data fetching with caching
  const { data: accounts = [], error, isLoading, mutate } = useSWR(
    debouncedSearchTerm.trim() 
      ? `/api/accounts/search?q=${encodeURIComponent(debouncedSearchTerm)}`
      : '/api/accounts/search',
    fetcher,
    {
      // Cache for 5 minutes
      dedupingInterval: 300000,
      // Revalidate on focus (background updates)
      revalidateOnFocus: true,
      // Revalidate on reconnect
      revalidateOnReconnect: true,
      // Keep previous data while loading new data
      keepPreviousData: true,
      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onSuccess: () => {
        setLastSearchedTerm(debouncedSearchTerm)
      }
    }
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  return {
    accounts,
    loading: isLoading,
    error: error?.message || null,
    searchTerm,
    handleSearchChange,
    hasInitialized: true, // SWR handles initialization
    mutate, // Allow manual cache invalidation if needed
    lastSearchedTerm,
  }
} 
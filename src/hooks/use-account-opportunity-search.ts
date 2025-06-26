import { useState, useEffect, useCallback } from 'react'
import { Account } from '@/lib/services/account-opportunity'
import { useDebouncedCallback } from './use-debounced-callback'

export function useAccountSearch() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    async (term: string) => {
      setLoading(true)
      try {
        const url = term.trim() 
          ? `/api/accounts/search?q=${encodeURIComponent(term)}`
          : '/api/accounts/search'
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setAccounts(data.accounts)
          setError(null)
        } else {
          setError(data.message || 'Failed to search accounts')
        }
      } catch (err) {
        setError('Failed to search accounts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    300 // 300ms debounce delay
  )

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  // Load initial data on mount
  useEffect(() => {
    debouncedSearch('')
  }, [debouncedSearch])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  return {
    accounts,
    loading,
    error,
    searchTerm,
    handleSearchChange,
  }
} 
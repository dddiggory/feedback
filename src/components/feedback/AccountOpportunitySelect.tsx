"use client"

import { useState, useEffect } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption, SingleValueProps, NoticeProps } from 'react-select'
import { Label } from "@/components/ui/label"
import { useAccountSearch } from '@/hooks/use-account-opportunity-search'
import { Account } from '@/lib/services/account-opportunity'
import { formatARR } from '@/lib/format'

interface AccountOption {
  value: string // SFDC_ACCOUNT_ID
  label: string // ACCOUNT_NAME
  account: Account // Full account data
}

// Prefetch common account searches
const prefetchCommonSearches = () => {
  // Common company names that users might search for
  const commonSearches = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'uber', 'airbnb']
  
  commonSearches.forEach(search => {
    // Use link prefetching for common searches
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = `/api/accounts/search?q=${encodeURIComponent(search)}`
    document.head.appendChild(link)
  })
}

const Option = (props: OptionProps<AccountOption, false, GroupBase<AccountOption>>) => {
  const { data, selectProps } = props;
  const searchStr = selectProps.inputValue;
  const { account } = data;
  
  const highlightText = (text: string, searchStr: string) => {
    if (!searchStr) return text;
    const parts = text.split(new RegExp(`(${searchStr})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchStr.toLowerCase() ?
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span> :
        part
    );
  };

  // Format the updated date for display
  const formatUpdatedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'last update: today';
    if (diffInDays === 1) return 'last update: yesterday';
    if (diffInDays < 7) return `last update: ${diffInDays}d ago`;
    if (diffInDays < 30) return `last update: ${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `last update: ${Math.floor(diffInDays / 30)}mo ago`;
    return `last update: ${Math.floor(diffInDays / 365)}y ago`;
  };
  
  return (
    <components.Option {...props}>
      <div className="flex items-start justify-between w-full gap-3">
        {/* Left side: Account name and ENT badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="truncate font-medium">
            {highlightText(account.ACCOUNT_NAME, searchStr)}
          </span>
          {account.IS_ACTIVE_ENTERPRISE_CUSTOMER && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200 flex-shrink-0">ENT</span>
          )}
        </div>
        
        {/* Right side: ARR and Updated date in two sub-rows */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-sm text-gray-600 font-mono tabular-nums whitespace-nowrap">
            {formatARR(account.ANNUAL_RECURRING_REVENUE)}
          </span>
          <span className="text-xs text-gray-400 font-mono tabular-nums whitespace-nowrap">
            {formatUpdatedDate(account.UPDATED_AT || '')}
          </span>
        </div>
      </div>
    </components.Option>
  );
};

const SingleValue = (props: SingleValueProps<AccountOption, false>) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center justify-between w-full">
        <span className="truncate mr-2">{data.label}</span>
        <span className="text-gray-500 font-mono tabular-nums text-xs flex-shrink-0">{formatARR(data.account.ANNUAL_RECURRING_REVENUE)}</span>
      </div>
    </components.SingleValue>
  );
};

interface AccountOpportunitySelectProps {
  value?: string; // SFDC_ACCOUNT_ID
  onChange?: (value: string, account?: Account) => void; // Modified to pass full account data
}

export function AccountOpportunitySelect({ value, onChange }: AccountOpportunitySelectProps) {
  const { accounts, loading, error, searchTerm, handleSearchChange, lastSearchedTerm } = useAccountSearch()
  const [selectedOption, setSelectedOption] = useState<AccountOption | null>(null)

  // Prefetch common searches on mount
  useEffect(() => {
    prefetchCommonSearches()
  }, [])

  // Convert accounts to options format
  const accountOptions: AccountOption[] = accounts.map(account => ({
    value: account.SFDC_ACCOUNT_ID,
    label: account.ACCOUNT_NAME,
    account: account
  }))

  // Sync selectedOption with value prop ONLY when value changes
  useEffect(() => {
    if (value) {
      // Try to find the option in the current options
      const option = accountOptions.find(acc => acc.value === value)
      // If found, set it; if not, preserve the current selection
      if (option) {
        setSelectedOption(option)
      }
      // If not found, do not reset selectedOption (prevents flicker)
    } else {
      setSelectedOption(null)
    }
    // Only run when value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (option: AccountOption | null) => {
    setSelectedOption(option)
    if (onChange) {
      // Always pass both parameters - the old signature will ignore the second parameter
      onChange(option?.value || '', option?.account)
    }
  }

  const handleInputChange = (inputValue: string) => {
    handleSearchChange(inputValue)
  }

  const filterOption = (
    option: FilterOptionOption<AccountOption>,
    inputValue: string
  ) => {
    const label = option.label || ''
    return label.toLowerCase().includes(inputValue.toLowerCase())
  }

  // Determine if we should show loading state in the dropdown
  // Only show loading if we have no accounts AND we're loading
  const showLoadingInDropdown = loading && accounts.length === 0

  // Custom NoOptionsMessage component (closure has access to all needed state)
  const NoOptionsMessage = (props: NoticeProps<AccountOption, false, GroupBase<AccountOption>>) => {
    const { selectProps } = props;
    const { inputValue } = selectProps;
    // If loading and the input value does not match the last searched term, we're still searching
    if (loading && inputValue !== lastSearchedTerm) {
      return (
        <div className="px-3 py-2 text-sm text-gray-500">
          Searching accounts...
        </div>
      );
    }
    // If not loading, input matches last searched term, and there are no options, show no results
    if (!loading && inputValue === lastSearchedTerm && accountOptions.length === 0 && inputValue.trim()) {
      return (
        <div className="px-3 py-2 text-sm text-gray-500">
          No accounts found for &quot;{inputValue}&quot;
        </div>
      );
    }
    // Otherwise, show the default prompt
    return (
      <div className="px-3 py-2 text-sm text-gray-500">
        Start typing to search for accounts...
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {/* <Label htmlFor="account-opportunity">Account/Opportunity<span className="text-red-500">*</span></Label> */}
      <Select
        id="account-opportunity"
        value={selectedOption}
        onChange={handleChange}
        options={accountOptions}
        filterOption={filterOption}
        components={{ Option, SingleValue, NoOptionsMessage }}
        className="react-select-container bg-white"
        classNamePrefix="react-select"
        placeholder={loading ? "Loading accounts..." : "Search for an account..."}
        isClearable
        isSearchable
        isLoading={showLoadingInDropdown}
        onInputChange={handleInputChange}
        inputValue={searchTerm}
        menuIsOpen={undefined}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '42px',
            borderColor: 'var(--border)',
            '&:hover': {
              borderColor: 'var(--ring)'
            }
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
            color: state.isFocused ? 'var(--accent-foreground)' : 'inherit',
            '&:active': {
              backgroundColor: 'var(--accent)'
            }
          })
        }}
      />
      {error && (
        <div className="text-sm text-red-500 mt-1">
          {error}
        </div>
      )}
    </div>
  )
} 
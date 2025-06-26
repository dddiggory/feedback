"use client"

import { useState, useEffect } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption, SingleValueProps } from 'react-select'
import { Label } from "@/components/ui/label"
import { useAccountSearch } from '@/hooks/use-account-opportunity-search'
import { Account } from '@/lib/services/account-opportunity'
import { formatARR } from '@/lib/format'

interface AccountOption {
  value: string // SFDC_ACCOUNT_ID
  label: string // ACCOUNT_NAME
  account: Account // Full account data
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
  
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-medium">
            {highlightText(account.ACCOUNT_NAME, searchStr)}
          </span>
          {account.IS_ACTIVE_ENTERPRISE_CUSTOMER && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">ENT</span>
          )}
        </div>
        <span className="text-sm text-gray-600 font-mono tabular-nums whitespace-nowrap">
          {formatARR(account.ANNUAL_RECURRING_REVENUE)}
        </span>
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
  onChange?: (value: string) => void;
}

export function AccountOpportunitySelect({ value, onChange }: AccountOpportunitySelectProps) {
  const { accounts, loading, error, searchTerm, handleSearchChange } = useAccountSearch()
  const [selectedOption, setSelectedOption] = useState<AccountOption | null>(null)

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
      onChange(option?.value || '')
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

  return (
    <div className="grid gap-2">
      {/* <Label htmlFor="account-opportunity">Account/Opportunity<span className="text-red-500">*</span></Label> */}
      <Select
        id="account-opportunity"
        value={selectedOption}
        onChange={handleChange}
        options={accountOptions}
        filterOption={filterOption}
        components={{ Option, SingleValue }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={loading ? "Loading accounts..." : "Search for an account..."}
        isClearable
        isSearchable
        isLoading={loading}
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
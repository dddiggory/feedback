"use client"

import { useState } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption } from 'react-select'
import { Label } from "@/components/ui/label"

interface AccountOption {
  value: string
  label: string
}

const accounts: AccountOption[] = [
  { value: 'bain', label: 'Bain' },
  { value: 'boston-consulting-group', label: 'Boston Consulting Group' },
  { value: 'mckinsey', label: 'McKinsey' },
  { value: 'mintlify', label: 'Mintlify' },
  { value: 'pump-fun', label: 'Pump.fun' },
  { value: 'the-new-york-times', label: 'The New York Times' },
  { value: 'under-armour', label: 'Under Armour' },
].sort((a, b) => a.label.localeCompare(b.label));

const Option = (props: OptionProps<AccountOption, false, GroupBase<AccountOption>>) => {
  const { data, selectProps } = props;
  const searchStr = selectProps.inputValue;
  const highlightText = (text: string, searchStr: string) => {
    if (!searchStr) return text;
    const parts = text.split(new RegExp(`(${searchStr})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchStr.toLowerCase() ?
        <span key={i} className="bg-yellow-200">{part}</span> :
        part
    );
  };
  return (
    <components.Option {...props}>
      <div className="py-1 font-medium">
        {highlightText(data.label, searchStr)}
      </div>
    </components.Option>
  );
};

export function AccountOpportunitySelect() {
  const [selectedOption, setSelectedOption] = useState<AccountOption | null>(null)

  const filterOption = (
    option: FilterOptionOption<AccountOption>,
    inputValue: string
  ) => {
    const label = option.label || ''
    return label.toLowerCase().includes(inputValue.toLowerCase())
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="account-opportunity">Account/Opportunity</Label>
      <Select
        id="account-opportunity"
        value={selectedOption}
        onChange={setSelectedOption}
        options={accounts}
        filterOption={filterOption}
        components={{ Option }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Search for an account or opportunity..."
        isClearable
        isSearchable
        tabIndex={0}
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
    </div>
  )
} 
"use client"

import { useState, useEffect } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption } from 'react-select'
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'
import { highlightText } from '@/lib/highlight'

interface FeedbackItemRow {
  id: string;
  title: string;
  description: string;
}

interface FeedbackItem {
  value: string
  label: string
  description: string
}



const Option = (props: OptionProps<FeedbackItem, false, GroupBase<FeedbackItem>>) => {
  const { data, selectProps } = props;
  const searchStr = selectProps.inputValue;
  return (
    <components.Option {...props}>
      <div className="py-1">
        <div className="font-medium">
          {highlightText(data.label, searchStr)}
        </div>
        <div className="text-sm text-gray-500">
          {highlightText(data.description, searchStr)}
        </div>
      </div>
    </components.Option>
  );
};

interface FeedbackItemSelectProps {
  defaultValue?: string
}

export function FeedbackItemSelect({ defaultValue }: FeedbackItemSelectProps) {
  const [selectedOption, setSelectedOption] = useState<FeedbackItem | null>(null)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeedbackItems = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_feedback_items')
        .select('id, title, description')

      if (error) {
        console.error('Error fetching feedback items:', error)
        return
      }

      const formattedItems = (data as FeedbackItemRow[]).map(item => ({
        value: item.id,
        label: item.title,
        description: item.description
      }))

      setFeedbackItems(formattedItems)
      
      // Set default value if provided
      if (defaultValue) {
        const defaultItem = formattedItems.find(item => item.value === defaultValue)
        if (defaultItem) {
          setSelectedOption(defaultItem)
        }
      }
      
      setIsLoading(false)
    }
    fetchFeedbackItems()
  }, [defaultValue])

  const filterOption = (
    option: FilterOptionOption<FeedbackItem>,
    inputValue: string
  ) => {
    const searchStr = inputValue.toLowerCase()
    const label = option.label || ''
    const description = (option.data && option.data.description) || ''
    return (
      label.toLowerCase().includes(searchStr) ||
      description.toLowerCase().includes(searchStr)
    )
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="feedback-item">Feedback Item</Label>
      <Select
        id="feedback-item"
        value={selectedOption}
        onChange={setSelectedOption}
        options={feedbackItems}
        filterOption={filterOption}
        components={{ Option }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={isLoading ? "Loading feedback items..." : "Search for an existing feedback item..."}
        isClearable
        isSearchable
        isLoading={isLoading}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '42px',
            backgroundColor: 'white',
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
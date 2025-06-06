"use client"

import { useState, useEffect, MouseEvent } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

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

// Helper to normalize text by removing punctuation and normalizing whitespace
function normalizeText(str: string) {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%^&*;:{}=_`~()\[\]"'’"“<>?|+=-]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

const highlightText = (text: string, searchStr: string) => {
  if (!searchStr) return text;
  const normText = normalizeText(text);
  const normSearch = normalizeText(searchStr);
  if (!normSearch) return text;

  // Find all match indices in the normalized text
  let matchIndices: [number, number][] = [];
  let startIdx = 0;
  while (startIdx <= normText.length) {
    const idx = normText.indexOf(normSearch, startIdx);
    if (idx === -1) break;
    matchIndices.push([idx, idx + normSearch.length]);
    startIdx = idx + normSearch.length;
  }
  if (matchIndices.length === 0) return text;

  // Map normalized indices back to original text indices
  let origIdx = 0, normIdx = 0, parts = [], lastEnd = 0, matchIdx = 0;
  while (origIdx < text.length && matchIdx < matchIndices.length) {
    const [matchStart, matchEnd] = matchIndices[matchIdx];
    // Advance to matchStart in normalized text
    let realStart = origIdx;
    while (normIdx < matchStart && origIdx < text.length) {
      if (/[^\w\s]/.test(text[origIdx])) {
        origIdx++;
      } else {
        origIdx++;
        normIdx++;
      }
    }
    realStart = origIdx;
    // Advance to matchEnd in normalized text
    let realEnd = origIdx;
    while (normIdx < matchEnd && origIdx < text.length) {
      if (/[^\w\s]/.test(text[origIdx])) {
        origIdx++;
      } else {
        origIdx++;
        normIdx++;
      }
    }
    realEnd = origIdx;
    // Push non-matching part
    if (lastEnd < realStart) {
      parts.push(text.slice(lastEnd, realStart));
    }
    // Push matching part
    parts.push(<span key={realStart} className="bg-yellow-200">{text.slice(realStart, realEnd)}</span>);
    lastEnd = realEnd;
    matchIdx++;
  }
  // Push any remaining text
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }
  return parts;
};

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

const MenuList = (props: any) => {
  const handleFooterClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Placeholder for future functionality
    alert('Create new feedback item (to be implemented)');
  };

  return (
    <div>
      <components.MenuList {...props} />
      <div
        onClick={handleFooterClick}
        className="px-4 py-3 text-left text-sm font-semibold text-black bg-orange-200 hover:bg-orange-400 cursor-pointer select-none rounded-b-md"
        style={{ borderTop: '1px solid #fbbf24' }}
      >
        ＋ None of these existing items are what I had in mind; Create a brand new feedback item instead.
      </div>
    </div>
  );
};

const Select: any = dynamic(() => import('react-select').then(mod => mod.default), { ssr: false })
import { components, GroupBase, OptionProps, FilterOptionOption } from 'react-select'

export function FeedbackSearchBox() {
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
      setIsLoading(false)
    }
    fetchFeedbackItems()
  }, [])

  const filterOption = (
    option: FilterOptionOption<FeedbackItem>,
    inputValue: string
  ) => {
    const searchStr = normalizeText(inputValue);
    const label = normalizeText(option.label || '');
    const description = normalizeText((option.data && option.data.description) || '');
    return (
      label.includes(searchStr) ||
      description.includes(searchStr)
    );
  }

  return (
    <div className="w-full rounded-xl bg-green-200 overflow-hidden">
      <Select
        value={selectedOption as any}
        onChange={setSelectedOption as any}
        options={feedbackItems as any}
        filterOption={filterOption as any}
        components={{ Option, MenuList } as any}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Start typing to add customer feedback..."
        isClearable
        isSearchable
        isLoading={isLoading}
        autoFocus
        menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '52px',
            borderColor: 'var(--border)',
            borderRadius: '0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '100%',
            backgroundColor: 'white',
            borderWidth: '2px',
            '&:hover': {
              borderColor: 'var(--ring)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
            },
            '&:focus-within': {
              borderColor: 'var(--ring)',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
            }
          }),
          valueContainer: (base) => ({
            ...base,
            backgroundColor: 'white',
          }),
          input: (base) => ({
            ...base,
            fontSize: '1.525rem',
            lineHeight: '1.75rem',
            padding: '1.25rem 1.25rem 1.25rem 2rem',
            fontWeight: '500',
            // backgroundColor: 'white',
          }),
          menu: (base) => ({
            ...base,
            width: '100%',
            maxWidth: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            overflow: 'hidden'
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: '1.525rem',
            lineHeight: '1.75rem',
            color: '',
            fontWeight: '500',
            padding: '1.25rem 1.25rem 1.25rem 2.5rem',
            opacity: '0.9'
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
            color: state.isFocused ? 'var(--accent-foreground)' : 'inherit',
            padding: '12px 16px',
            '&:active': {
              backgroundColor: 'var(--accent)'
            }
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999
          }),
          singleValue: (base) => ({
            ...base,
            fontSize: '1.525rem',
            padding: '1.25rem 1.25rem 1.25rem 2rem',
            fontWeight: '500'
          }),
          indicatorsContainer: (base) => ({
            ...base,
            backgroundColor: 'white',
          }),
          dropdownIndicator: (base) => ({
            ...base,
            backgroundColor: 'white',
          }),
        }}
      />
    </div>
  )
} 
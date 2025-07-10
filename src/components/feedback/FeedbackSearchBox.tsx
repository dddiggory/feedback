"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { components, GroupBase, OptionProps, FilterOptionOption, MenuListProps, Props as SelectProps } from 'react-select'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { JSX } from 'react'

interface FeedbackItemRow {
  id: string;
  title: string;
  description: string;
  slug: string;
}

interface FeedbackItem {
  value: string
  label: string
  description: string
  slug: string
}

// Helper to normalize text by removing punctuation and normalizing whitespace
function normalizeText(str: string) {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%^&*;:{}=_`~()\[\]"''"<>?|+=-]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

// Highlight all occurrences of each word in the search string, even if split by unrelated words
const highlightText = (text: string, searchStr: string) => {
  if (!searchStr) return text;
  const normText = normalizeText(text);
  const words = normalizeText(searchStr).split(' ').filter(Boolean);
  if (words.length === 0) return text;

  // Find all match indices for all words, even if split by unrelated words
  let matchIndices: [number, number][] = [];
  for (const word of words) {
    let startIdx = 0;
    while (startIdx <= normText.length) {
      const idx = normText.indexOf(word, startIdx);
      if (idx === -1) break;
      matchIndices.push([idx, idx + word.length]);
      startIdx = idx + word.length;
    }
  }
  // Remove duplicate and overlapping matches
  matchIndices = matchIndices.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of matchIndices) {
    if (!merged.length || start > merged[merged.length - 1][1]) {
      merged.push([start, end]);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    }
  }
  if (merged.length === 0) return text;

  // Map normalized indices back to original text indices
  const parts: (string | JSX.Element)[] = [];
  let origIdx = 0, normIdx = 0, lastEnd = 0, matchIdx = 0;
  while (origIdx < text.length && matchIdx < merged.length) {
    const [matchStart, matchEnd] = merged[matchIdx];
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
        <div className="text-sm text-gray-500 whitespace-pre-line">
          {highlightText(data.description, searchStr)}
        </div>
      </div>
    </components.Option>
  );
};

const createMenuList = (onCreateNew?: () => void) => {
  return (props: MenuListProps<FeedbackItem, false, GroupBase<FeedbackItem>>) => {
    return (
      <div>
        <components.MenuList {...props} />
        <Link href="/feedback/new">
          <div
            className="px-4 py-3 text-left text-sm font-semibold text-black bg-orange-200 hover:bg-orange-400 cursor-pointer select-none rounded-b-md"
            style={{ borderTop: '1px solid #fbbf24' }}
            onClick={() => onCreateNew?.()}
          >
            ＋ None of these existing items are what I had in mind; Create a brand new feedback item instead.
          </div>
        </Link>
      </div>
    );
  };
};

const Select = dynamic<SelectProps<FeedbackItem, false, GroupBase<FeedbackItem>>>(
  () => import('react-select').then(mod => mod.default),
  { ssr: false }
)

interface FeedbackSearchBoxProps {
  onSelect?: (option: FeedbackItem | null) => void
  onCreateNew?: () => void
  placeholder?: string
}

export function FeedbackSearchBox({ onSelect, onCreateNew, placeholder }: FeedbackSearchBoxProps = {}) {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<FeedbackItem | null>(null)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeedbackItems = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('feedback_items_with_data')
        .select('id, title, description, slug')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching feedback items:', error)
        return
      }

      const formattedItems = (data as FeedbackItemRow[]).map(item => ({
        value: item.id,
        label: item.title,
        description: item.description,
        slug: item.slug
      }))

      setFeedbackItems(formattedItems)
      setIsLoading(false)
    }
    fetchFeedbackItems()
  }, [])

  const handleChange = (option: FeedbackItem | null) => {
    setSelectedOption(option)
    if (option?.slug) {
      router.push(`/feedback/${option.slug}`)
    }
    // Call the onSelect callback if provided
    onSelect?.(option)
  }

  const filterOption = (
    option: FilterOptionOption<FeedbackItem>,
    inputValue: string
  ) => {
    const words = normalizeText(inputValue).split(' ').filter(Boolean);
    const label = normalizeText(option.label || '');
    const description = normalizeText((option.data && option.data.description) || '');
    // Return true if every word is found in either label or description
    return words.every(
      word => label.includes(word) || description.includes(word)
    );
  }

  const MenuList = createMenuList(onCreateNew);

  return (
    <div className="w-full rounded-xl bg-green-200 overflow-hidden">
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={feedbackItems}
        filterOption={filterOption}
        components={{ Option, MenuList }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={placeholder || "Start typing to add or view customer feedback..."}
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
          }),
          menu: (base) => ({
            ...base,
            width: '100%',
            maxWidth: '100%',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            overflow: 'hidden'
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
          placeholder: (base) => ({
            ...base,
            fontSize: '1.525rem',
            lineHeight: '1.75rem',
            color: 'oklch(29.3% 0.066 243.157)',
            fontWeight: '500',
            padding: '1.25rem 1.25rem 1.25rem 2.5rem',
            opacity: 0.9,
          }),
        }}
      />
    </div>
  )
} 
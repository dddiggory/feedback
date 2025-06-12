"use client"

import { useState, useEffect } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption } from 'react-select'
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'

interface ProductAreaRow {
  name: string;
  slug: string;
  description: string;
}

interface ProductArea {
  value: string
  label: string
  description: string
}

const highlightText = (text: string, searchStr: string) => {
  if (!searchStr) return text;
  
  const parts = text.split(new RegExp(`(${searchStr})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === searchStr.toLowerCase() ? 
      <span key={i} className="bg-yellow-200">{part}</span> : 
      part
  );
};

const Option = (props: OptionProps<ProductArea, false, GroupBase<ProductArea>>) => {
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

interface ProductAreaSelectProps {
  defaultValue?: string[]
}

export function ProductAreaSelect({ defaultValue }: ProductAreaSelectProps) {
  const [selectedOption, setSelectedOption] = useState<ProductArea | null>(null)
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductAreas = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_areas')
        .select('name, slug, description')

      if (error) {
        console.error('Error fetching product areas:', error)
        return
      }

      const formattedAreas = (data as ProductAreaRow[]).map(area => ({
        value: area.slug,
        label: area.name,
        description: area.description
      }))

      setProductAreas(formattedAreas)
      
      // Set default value if provided
      if (defaultValue && defaultValue.length > 0) {
        const defaultArea = formattedAreas.find(area => area.value === defaultValue[0])
        if (defaultArea) {
          setSelectedOption(defaultArea)
        }
      }
      
      setIsLoading(false)
    }

    fetchProductAreas()
  }, [defaultValue])

  const filterOption = (
    option: FilterOptionOption<ProductArea>,
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
      <Label htmlFor="product-area">Product Area</Label>
      <Select
        id="product-area"
        value={selectedOption}
        onChange={setSelectedOption}
        options={productAreas}
        filterOption={filterOption}
        components={{ Option }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={isLoading ? "Loading product areas..." : "Search for a product area..."}
        isClearable
        isSearchable
        isLoading={isLoading}
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
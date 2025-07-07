"use client"

import { useState, useEffect } from 'react'
import Select, { components, GroupBase, OptionProps, FilterOptionOption } from 'react-select'
import { createClient } from '@/lib/supabase/client'
import { highlightText } from '@/lib/highlight'

interface ProductAreaRow {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface ProductArea {
  value: string
  label: string
  description: string
}



const Option = (props: OptionProps<ProductArea, true, GroupBase<ProductArea>>) => {
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
  value?: ProductArea[]
  onChange?: (selected: ProductArea[]) => void
}

export function ProductAreaSelect({ defaultValue, value, onChange }: ProductAreaSelectProps) {
  const [selectedOptions, setSelectedOptions] = useState<ProductArea[]>([])
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductAreas = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('product_areas')
        .select('id, name, slug, description')

      if (error) {
        console.error('Error fetching product areas:', error)
        return
      }

      const formattedAreas = (data as ProductAreaRow[]).map(area => ({
        value: area.id,
        label: area.name,
        description: area.description
      }))

      setProductAreas(formattedAreas)
      
      // Set default value if provided
      if (defaultValue && defaultValue.length > 0) {
        const defaultAreas = formattedAreas.filter(area => defaultValue.includes(area.value))
        setSelectedOptions(defaultAreas)
      }
      setIsLoading(false)
    }

    fetchProductAreas()
  }, [defaultValue])

  // Keep local state in sync with parent value
  useEffect(() => {
    if (value) {
      setSelectedOptions(value)
    }
  }, [value])

  const handleChange = (options: readonly ProductArea[] | null) => {
    const arr = options ? Array.from(options) : []
    setSelectedOptions(arr)
    if (onChange) {
      onChange(arr)
    }
  }

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
      {/* <Label htmlFor="product-area">Product Area(s)</Label> */}
      <Select<ProductArea, true, GroupBase<ProductArea>>
        id="product-area"
        value={selectedOptions}
        onChange={handleChange}
        options={productAreas}
        filterOption={filterOption}
        components={{ Option }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={isLoading ? "Loading product areas..." : "Search for product areas..."}
        isClearable
        isSearchable
        isLoading={isLoading}
        isMulti
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
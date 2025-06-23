"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Layout } from '@/components/layout/Layout'
import { ProductAreaSelect } from '@/components/feedback/ProductAreaSelect'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewFeedbackPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProductAreas, setSelectedProductAreas] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // 1. Insert feedback item
      const { data: item, error } = await supabase
        .from('product_feedback_items')
        .insert({
          title,
          description,
          slug,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Insert into join table for each selected product area
      if (item && selectedProductAreas.length > 0) {
        const joinRows = selectedProductAreas.map((area) => ({
          feedback_item_id: item.id,
          product_area_id: area.value, // area.value is the product_area_id (uuid)
        }))
        console.log('Join table payload:', joinRows)
        const { error: joinError } = await supabase.from('items_to_areas').insert(joinRows)
        if (joinError) throw joinError
      }

      // Redirect to the new feedback item
      router.push(`/feedback/${slug}`)
    } catch (error) {
      console.error('Error creating feedback item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Create New Feedback Item</h1>
          <p className="text-slate-300 mt-2">
            Most of the time, you should add your customer&apos;s +1 to an existing feedback item, to help build a case for that request. However, if you&apos;re certain that you have a brand new type of feedback that hasn&apos;t been requested by anyone else before, you can use this form to create a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title for the request"
              required
              style={{backgroundColor: 'rgb(248 250 252)'}}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-area">Product Area(s)</Label>
            <div style={{backgroundColor: 'rgb(248 250 252)'}}>
              <ProductAreaSelect value={selectedProductAreas} onChange={setSelectedProductAreas} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">General Description (NOT customer-specific)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the pain point and the potential solution, in a general, customer-agnostic way. You can provide a customer-specific anecdote on the next step."
              className="min-h-[120px]"
              style={{backgroundColor: 'rgb(248 250 252)'}}
              required
            />
          </div>

          

          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Feedback Item'}
          </Button>
        </form>
      </div>
    </Layout>
  )
} 
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ReactNode, useState, useRef, useEffect } from "react"
import { AccountOpportunitySelect, accounts } from "./AccountOpportunitySelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'

interface FeedbackPageLogFeedbackDialogProps {
  trigger?: ReactNode
  feedbackItemTitle: string
  feedbackItemDescription: string
  feedbackItemId: string
}

export function FeedbackPageLogFeedbackDialog({ 
  trigger,
  feedbackItemTitle,
  feedbackItemDescription,
  feedbackItemId,
}: FeedbackPageLogFeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState("med")
  const [accountName, setAccountName] = useState("")
  const [description, setDescription] = useState("")
  const [links, setLinks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (formRef.current && !isSubmitting) {
          formRef.current.requestSubmit()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('entries')
        .upsert({
          feedback_item_id: feedbackItemId,
          account_name: accountName,
          severity: severity,
          entry_description: description,
          external_links: links,
          contact_person: "diggory.rycroft",
          open_opp_arr: 60000,
          current_arr: 120000
        })

      if (error) throw error

      // Reset form
      setAccountName("")
      setSeverity("med")
      setDescription("")
      setLinks("")
      
      // Close dialog
      setOpen(false)

      // Add a small delay before refreshing to ensure the database update is complete
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Focus the description textarea after account selection
  const handleAccountChange = (value: string) => {
    // Find the account option that matches this value
    const account = accounts.find(acc => acc.value === value)
    if (account) {
      setAccountName(account.value)
    }
    // Focus the textarea after a short delay to allow react-select to finish
    setTimeout(() => {
      descriptionRef.current?.focus()
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="inline-flex items-center gap-x-2.5 rounded-xl bg-black px-6 py-3.5 text-lg font-semibold text-white shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer">
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Customer +1
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-3xl bg-stone-100">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="text-xs text-gray-500">Add Customer +1</div>
            <DialogTitle className="text-2xl text-blue-600 font-bold">
              {feedbackItemTitle}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              {feedbackItemDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-4">
                <Label className="pb-2"htmlFor="account">Account/Opportunity<span className="text-red-500">*</span></Label>
                <AccountOpportunitySelect value={accountName} onChange={handleAccountChange} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity" className="py-5 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">25%: Nice-to-Have</SelectItem>
                    <SelectItem value="med">50%: Significant Pain Point</SelectItem>
                    <SelectItem value="high">90%: Dealbreaker/Churn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label htmlFor="description">Customer Pain Description<span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500">
                  What specific pain / problem is the customer experiencing? What will this help the customer achieve?
                </p>
              </div>
              <Textarea
                id="description"
                placeholder="Briefly describe customer situation here"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                ref={descriptionRef}
              />
            </div>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label htmlFor="links">Relevant External Links</Label>
                <p className="text-sm text-gray-500">
                  Add any relevant links (one per line, please) that provide additional context (e.g., Slack, Notion, Gong clips, etc.)
                </p>
              </div>
              <Textarea
                id="links"
                placeholder="https://..."
                className="min-h-[60px]"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="cursor-pointer" 
              type="submit" 
              disabled={isSubmitting || !accountName || !description.trim()}
            >
              {isSubmitting 
                ? "Submitting..." 
                : (!accountName || !description.trim())
                  ? "Complete Required Fields Before Submitting"
                  : "Submit Feedback (Cmd+Enter)"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
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
import { ReactNode } from "react"
import { AccountOpportunitySelect } from "./AccountOpportunitySelect"

interface FeedbackPageLogFeedbackDialogProps {
  trigger?: ReactNode
  feedbackItemId: string
  feedbackItemTitle: string
  productAreaIds?: string[]
}

export function FeedbackPageLogFeedbackDialog({ 
  trigger,
  feedbackItemId,
  feedbackItemTitle,
  productAreaIds
}: FeedbackPageLogFeedbackDialogProps) {
  return (
    <Dialog>
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
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Customer +1: 
            <span className="text-blue-600 font-bold pl-2">{feedbackItemTitle}</span>
            </DialogTitle>
          <DialogDescription>
            test
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <AccountOpportunitySelect />
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your feedback or idea in detail"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
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
import { ReactNode, useState, useRef, useEffect, useCallback } from "react"
import { AccountOpportunitySelect } from "./AccountOpportunitySelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImpactedOpportunityPills } from './ImpactedOpportunityPills'
import { useOpportunitiesByAccount } from '@/hooks/use-opportunities-by-account'
import { useAccountSearch } from '@/hooks/use-account-opportunity-search'
import { Account } from '@/lib/services/account-opportunity'
import { Opportunity } from '@/lib/services/opportunity'
import { createEntryWithWebhook } from '@/lib/actions/webhook'
import { upload } from '@vercel/blob/client'

// Minimal shape used from the upload response
type BlobUploadResult = {
  url: string
}

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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [description, setDescription] = useState("")
  const [links, setLinks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploaded, setUploaded] = useState<BlobUploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { opportunities, selectedId: selectedOpportunityId, setSelectedId: setSelectedOpportunityId, loading: loadingOpportunities } = useOpportunitiesByAccount(accountName)
  const { handleSearchChange } = useAccountSearch()

  // Prefetch initial accounts when dialog opens
  useEffect(() => {
    if (open) {
      // Trigger initial account load immediately when dialog opens
      handleSearchChange('')
    }
  }, [open, handleSearchChange])

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

  const MAX_IMAGES = 10
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const existing = pendingFiles.length
    const added: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!ACCEPTED.includes(f.type)) continue
      if (existing + added.length >= MAX_IMAGES) break
      added.push(f)
    }
    if (added.length) setPendingFiles(prev => [...prev, ...added])
  }, [pendingFiles.length])

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const onClickPicker = () => fileInputRef.current?.click()

  const removePending = (idx: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Use stored selected account data instead of searching in accounts array
    const selectedOpportunity: Opportunity | undefined = opportunities.find(opp => opp.SFDC_OPPORTUNITY_ID === selectedOpportunityId)

    try {
      // Use the server action instead of direct Supabase call
      const result = await createEntryWithWebhook({
        feedbackItemId,
        accountName: selectedAccount?.ACCOUNT_NAME ?? '',
        severity,
        description,
        links,
        currentArr: selectedAccount?.ANNUAL_RECURRING_REVENUE ?? null,
        openOppArr: selectedOpportunity?.NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE ?? null,
        sfdcAccount: selectedAccount?.ACCOUNT_LINK ?? null,
        companyWebsite: selectedAccount?.WEBSITE ?? null,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create entry')
      }

      // If images were selected, upload them and attach to the created entry
      if (result.entryId && pendingFiles.length > 0) {
        try {
          setUploading(true)
          const results: BlobUploadResult[] = []
          for (const file of pendingFiles) {
            const res = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/images/upload',
              // send scope so server route can build the pathname
              clientPayload: JSON.stringify({ scope: 'entry', parentId: result.entryId, filename: file.name }),
            })
            results.push(res)
            console.log('Uploaded to Blob:', res.url)
            // Attach in DB
            const attachResp = await fetch('/api/images/attach', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                scope: 'entry',
                parentId: result.entryId,
                blob: {
                  url: res.url,
                  // The Vercel Blob response does not include size/contentType; fall back to the File values
                  size: file.size,
                  contentType: file.type,
                },
              }),
            })
            if (!attachResp.ok) {
              const t = await attachResp.text()
              console.error('Attach failed:', attachResp.status, t)
            }
          }
          setUploaded(results)
        } catch (err) {
          console.error('Image upload/attach error:', err)
        } finally {
          setUploading(false)
        }
      }

      // Reset form
      setAccountName("")
      setSelectedAccount(null) // Reset selected account
      setSeverity("med")
      setDescription("")
      setLinks("")
      setPendingFiles([])
      setUploaded([])
      
      // Close dialog
      setOpen(false)

      // Add a small delay before refreshing to ensure the database update is complete
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // You could add user-facing error handling here if needed
    } finally {
      setIsSubmitting(false)
    }
  }

  // Focus the description textarea after account selection
  const handleAccountChange = (value: string, account?: Account) => {
    // value is the SFDC_ACCOUNT_ID, account is the full account data
    setAccountName(value)
    setSelectedAccount(account || null)
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
      <DialogContent className="sm:max-w-[425px] lg:max-w-3xl bg-stone-100 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="text-xs text-gray-500">Add Customer +1</div>
          <DialogTitle className="text-2xl text-blue-800 font-bold">
            {feedbackItemTitle}
          </DialogTitle>
          <DialogDescription className="outline-dotted rounded-sm p-1 text-sm text-gray-600 mt-2 max-h-[100px] overflow-y-scroll">
            {feedbackItemDescription}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 px-1 space-y-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-4">
                <Label className="pb-2"htmlFor="account">Customer / Account<span className="text-red-500">*</span></Label>
                <AccountOpportunitySelect value={accountName} onChange={handleAccountChange} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity" className="py-5 mt-2 bg-white">
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
            {/* Impacted Opportunity section - always reserve space, no layout shift */}
            <div style={{ minHeight: '64px' }} className="my-2 flex flex-col justify-center">
              <ImpactedOpportunityPills
                opportunities={opportunities}
                selectedId={selectedOpportunityId}
                setSelectedId={setSelectedOpportunityId}
                loading={loadingOpportunities}
                accountSelected={!!accountName}
              />
            </div>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label htmlFor="description">Customer Pain Description<span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500">
                  What specific pain / problem is the customer experiencing? What will this help the customer achieve? This flows into product area #firehose channels and gets ingested into analyses, so please write something short but meaningful. Please DON&apos;T just put &lsquo;see description above&rsquo; or similar.
                </p>
              </div>
              <Textarea
                id="description"
                placeholder="Briefly describe customer situation here. No 'see above' entries please!"
                className="min-h-[100px] max-h-[150px] bg-white resize-none overflow-y-auto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                ref={descriptionRef}
              />
            </div>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label htmlFor="links">Relevant External Links (optional)</Label>
                <p className="text-sm text-gray-500">
                  Add any relevant links (one per line, please) that provide additional context (e.g., Slack, Notion, Gong clips, etc.)
                </p>
              </div>
              <Textarea
                id="links"
                placeholder="https://..."
                className="min-h-[60px] max-h-[100px] bg-white resize-none overflow-y-auto"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
              />
            </div>
            
            {/* Image uploader */}
            <div className="space-y-2">
              <Label>Screenshots & Images (optional)</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={onClickPicker}
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer bg-white/60 hover:bg-white"
              >
                <p className="text-slate-700">Drag and drop images here, or click to browse</p>
                <p className="text-slate-500 text-sm mt-1">Up to {MAX_IMAGES} images. JPEG, PNG, WEBP.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED.join(',')}
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {pendingFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2">
                      <div className="truncate text-sm text-slate-700">{f.name}</div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePending(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && <div className="text-sm text-slate-600">Uploading images…</div>}
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4 px-1">
            <Button 
              className="cursor-pointer" 
              type="submit" 
              disabled={isSubmitting || uploading || !accountName || !description.trim() || loadingOpportunities}
            >
              {isSubmitting 
                ? "Submitting..." 
                : uploading
                  ? "Uploading images..."
                  : loadingOpportunities
                    ? "Loading opportunities..."
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
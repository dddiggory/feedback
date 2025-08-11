"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Edit, Save, X, Trash } from "lucide-react"
import { useUser } from "@/components/layout/UserContext"
import { useAdmin } from "@/hooks/use-admin"
import { createClient } from "@/lib/supabase/client"
import { getSeverityStyle } from "@/lib/utils"
import { formatARR } from "@/lib/format"

interface FeedbackEntry {
  id: string;
  feedback_item_id: string;
  account_name: string;
  entry_description: string;
  severity: string;
  current_arr: number;
  open_opp_arr: number;
  impacted_arr: number;
  created_by_user_id: string;
  created_at: string;
  submitter_name?: string;
  submitter_email?: string;
  total_arr?: number;
  sfdc_account?: string | null;
  company_website?: string | null;
  entry_key?: string;
  external_links?: string | null;
}

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  slug: string;
}

interface EntryDetailModalProps {
  entry: FeedbackEntry;
  feedbackItem: FeedbackItem;
  isIntercepted?: boolean;
}



export function EntryDetailModal({ entry, feedbackItem, isIntercepted = false }: EntryDetailModalProps) {
  const [open, setOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(entry.entry_description)
  // Normalize severity value (convert "med" to "medium")
  const normalizeSeverity = (severity: string) => {
    const normalized = severity.toLowerCase();
    return normalized === 'med' ? 'medium' : normalized;
  }
  
  const [editedSeverity, setEditedSeverity] = useState(normalizeSeverity(entry.severity))
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { isAdmin } = useAdmin()
  const supabase = createClient()

  // Check if current user is the submitter or an admin
  const isOwner = user?.id === entry.created_by_user_id
  const canEdit = isOwner || isAdmin

  // Close modal handler
  const handleClose = () => {
    setOpen(false)
    if (isIntercepted) {
      router.back()
    }
  }

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!canEdit) return
    setIsEditing(!isEditing)
    if (!isEditing) {
      // Reset to original values when entering edit mode
      setEditedDescription(entry.entry_description)
      setEditedSeverity(normalizeSeverity(entry.severity))
    }
  }

  // Handle save changes
  const handleSave = async () => {
    if (!canEdit || isSaving) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('entries')
        .update({ 
          entry_description: editedDescription,
          severity: editedSeverity 
        })
        .eq('id', entry.id)

      if (error) {
        console.error('Error updating entry:', error)
        alert('Failed to save changes. Please try again.')
      } else {
        // Update local state
        entry.entry_description = editedDescription
        entry.severity = editedSeverity
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel edit
  const handleCancel = () => {
    setEditedDescription(entry.entry_description)
    setEditedSeverity(normalizeSeverity(entry.severity))
    setIsEditing(false)
  }

  // Handle delete entry
  const handleDelete = async () => {
    if (!canEdit) return
    
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback entry? This action cannot be undone."
    )
    
    if (!confirmed) return
    
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entry.id)

      if (error) {
        console.error('Error deleting entry:', error)
        alert('Failed to delete entry. Please try again.')
      } else {
        // Refresh the page to show the updated feedback list
        router.refresh()
        
        // Navigate back after successful deletion
        if (isIntercepted) {
          router.back()
        } else {
          router.push(`/feedback/${feedbackItem.slug}`)
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  // Clean up the website URL for logo display
  const cleanWebsite = entry.company_website 
    ? entry.company_website
        .replace(/^https?:\/\//, '') // Remove protocol
        .replace(/^www\./, '')       // Remove www prefix
        .replace(/\/$/, '')          // Remove trailing slash
        .split('/')[0]               // Remove path - keep only domain
        .toLowerCase()               // Ensure lowercase
    : null;
  
  // Generate logo URL if company website is available
  const logoUrl = cleanWebsite 
    ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=32&format=webp`
    : null;



  // Extract content into reusable function
  const renderContent = () => (
    <div className="grid gap-6 py-4">
      {/* Account Information */}
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              cleanWebsite ? (
                <Link href={`/accounts/${cleanWebsite}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <Image
                      src={logoUrl}
                      alt={`${entry.account_name} logo`}
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </Link>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-black">
                  <Image
                    src={logoUrl}
                    alt={`${entry.account_name} logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )
            ) : (
              cleanWebsite ? (
                <Link href={`/accounts/${cleanWebsite}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center border border-black hover:bg-gray-300 transition-colors cursor-pointer">
                    <span className="text-gray-500 text-xs font-medium">
                      {entry.account_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center border border-black">
                  <span className="text-gray-500 text-xs font-medium">
                    {entry.account_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            )}
            <div>
              <Label className="text-sm text-gray-500">Customer / Account</Label>
              <div className="font-semibold text-lg">
                {cleanWebsite ? (
                  <Link 
                    href={`/accounts/${cleanWebsite}`}
                    className="text-slate-700 hover:text-blue-800 underline"
                  >
                    {entry.account_name}
                  </Link>
                ) : (
                  entry.account_name
                )}
              </div>
            </div>
          </div>
          
          <div className="ml-auto">
            <Label className="text-sm text-gray-500">Severity</Label>
            <div className="flex justify-end mt-1">
              {isEditing ? (
                <Select 
                  value={editedSeverity} 
                  onValueChange={setEditedSeverity}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-fit min-w-[100px]">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityStyle(entry.severity)}`}>
                  {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1).toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ARR Information */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Current ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatARR(entry.current_arr)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Open Opp ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatARR(entry.open_opp_arr)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Impacted ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatARR(entry.total_arr)}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Customer Pain Description</Label>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    className={!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer bg-white hover:bg-sky-200'}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!canEdit && (
                    <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                      Only the original submitter ({entry.submitter_name || entry.submitter_email || 'Unknown'}) or admins can edit this feedback entry. Reach out to Field Engineering for exceptions.
                      <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    className={!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer bg-white hover:bg-red-200 text-red-600 border-red-300'}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Delete Entry
                  </Button>
                  {!canEdit && (
                    <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                      Only the original submitter ({entry.submitter_name || entry.submitter_email || 'Unknown'}) or admins can delete this feedback entry. Reach out to Field Engineering for exceptions.
                      <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {isEditing ? (
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="min-h-[120px] bg-white rounded-lg border resize-none"
            placeholder="Enter customer pain description..."
            disabled={isSaving}
          />
        ) : (
          <div className="bg-white rounded-lg p-4 border min-h-[120px] whitespace-pre-wrap">
            {entry.entry_description}
          </div>
        )}
      </div>

      {/* External Links */}
      {entry.external_links && (
        <div className="grid gap-2">
          <Label className="text-base font-semibold">External Links</Label>
          <div className="bg-white rounded-lg p-4 border">
            {entry.external_links.split('\n').map((link, index) => (
              link.trim() && (
                <div key={index} className="mb-2 last:mb-0">
                  <a 
                    href={link.trim()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {link.trim()}
                  </a>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <Label className="text-sm text-gray-500">Submitted by</Label>
          <div className="mt-1">
            {entry.submitter_name || entry.submitter_email || entry.created_by_user_id}
          </div>
        </div>
        <div>
          <Label className="text-sm text-gray-500">Submit Date</Label>
          <div className="mt-1">
            {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </div>

      {/* SFDC Link */}
      {entry.sfdc_account && (
        <div className="pt-2 border-t">
          <a 
            href={entry.sfdc_account} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Account in Salesforce →
          </a>
        </div>
      )}
    </div>
  );

  // For direct routes, render without dialog wrapper
  if (!isIntercepted) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto bg-stone-100 rounded-xl p-8">
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-2">Customer Feedback Entry</div>
            <h1 className="text-2xl text-sky-800 font-bold mb-4">
              <Link 
                href={`/feedback/${feedbackItem.slug}`}
                className="hover:text-sky-900 underline hover:underline"
              >
                {feedbackItem.title}
              </Link>
            </h1>
            <div className="outline-dotted rounded-sm p-1 text-sm text-black max-h-[100px] overflow-y-scroll">
              {feedbackItem.description}
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-4xl bg-stone-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-xs text-gray-500">Customer Feedback Entry</div>
          <DialogTitle className="text-2xl text-blue-800 font-bold">
            <Link 
              href={`/feedback/${feedbackItem.slug}`}
              className="hover:text-blue-600 underline hover:underline"
            >
              {feedbackItem.title}
            </Link>
          </DialogTitle>
          <DialogDescription className="outline-dotted rounded-sm p-1 text-sm text-gray-600 mt-2 max-h-[100px] overflow-y-scroll">
            {feedbackItem.description}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Edit, Save, X } from "lucide-react"
import { useUser } from "@/components/layout/UserContext"
import { createClient } from "@/lib/supabase/client"

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

// Helper function to format currency
function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || !isFinite(amount)) {
    return "$0";
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${Math.floor(amount / 1000)}k`;
  }
  return `$${amount}`;
}

export function EntryDetailModal({ entry, feedbackItem, isIntercepted = false }: EntryDetailModalProps) {
  const [open, setOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(entry.entry_description)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClient()

  // Check if current user is the submitter
  const isOwner = user?.id === entry.created_by_user_id

  // Close modal handler
  const handleClose = () => {
    setOpen(false)
    if (isIntercepted) {
      router.back()
    }
  }

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isOwner) return
    setIsEditing(!isEditing)
    if (!isEditing) {
      // Reset to original description when entering edit mode
      setEditedDescription(entry.entry_description)
    }
  }

  // Handle save changes
  const handleSave = async () => {
    if (!isOwner || isSaving) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('entries')
        .update({ entry_description: editedDescription })
        .eq('id', entry.id)

      if (error) {
        console.error('Error updating entry:', error)
        alert('Failed to save changes. Please try again.')
      } else {
        // Update local state
        entry.entry_description = editedDescription
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
    setIsEditing(false)
  }

  // Clean up the website URL for logo display
  const cleanWebsite = entry.company_website 
    ? entry.company_website
        .replace(/^https?:\/\//, '') // Remove protocol
        .replace(/^www\./, '')       // Remove www prefix
        .replace(/\/$/, '')          // Remove trailing slash
        .toLowerCase()               // Ensure lowercase
    : null;
  
  // Generate logo URL if company website is available
  const logoUrl = cleanWebsite 
    ? `https://img.logo.dev/${cleanWebsite}?token=pk_Lt5wNE7NT2qBNmqdZnx0og&size=32&format=webp`
    : null;

  // Get severity styling
  const getSeverityStyle = (sev: string) => {
    const normalized = sev.toLowerCase();
    switch (normalized) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
      case 'med':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Extract content into reusable function
  const renderContent = () => (
    <div className="grid gap-6 py-4">
      {/* Account Information */}
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={`${entry.account_name} logo`}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {entry.account_name.charAt(0).toUpperCase()}
                </span>
              </div>
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
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityStyle(entry.severity)}`}>
                {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ARR Information */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Current ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(entry.current_arr)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Open Opp ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(entry.open_opp_arr)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <Label className="text-sm text-gray-500">Impacted ARR</Label>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(entry.total_arr)}
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
              <div className="relative group">
                <Button
                  onClick={handleEditToggle}
                  variant="outline"
                  size="sm"
                  disabled={!isOwner}
                  className={!isOwner ? 'cursor-not-allowed opacity-50' : 'cursor-pointer bg-white hover:bg-sky-200'}
                >
                                   <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {!isOwner && (
                  <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    Only the original submitter ({entry.submitter_name || entry.submitter_email || 'Unknown'}) can edit this feedback entry. Reach out to Field Engineering for exceptions.
                    <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                )}
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
            View in Salesforce →
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
            <h1 className="text-2xl text-blue-800 font-bold mb-4">
              <Link 
                href={`/feedback/${feedbackItem.slug}`}
                className="hover:text-blue-600 underline hover:underline"
              >
                {feedbackItem.title}
              </Link>
            </h1>
            <div className="outline-dotted rounded-sm p-1 text-sm text-gray-600 max-h-[100px] overflow-y-scroll">
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
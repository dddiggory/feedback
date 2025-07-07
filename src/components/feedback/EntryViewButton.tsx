"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface EntryViewButtonProps {
  feedbackItemSlug: string;
  entryKey: string;
}

export function EntryViewButton({ feedbackItemSlug, entryKey }: EntryViewButtonProps) {
  const router = useRouter();

  const handleViewEntry = () => {
    router.push(`/feedback/${feedbackItemSlug}/entries/${entryKey}`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="cursor-pointer h-6 w-6 p-0 flex-shrink-0 hover:bg-sky-100 outline-slate-300 outline"
      onClick={handleViewEntry}
    >
      <Eye className="h-4 w-4 text-gray-500" />
    </Button>
  );
} 
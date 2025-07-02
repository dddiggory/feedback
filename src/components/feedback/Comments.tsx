interface CommentsProps {
  feedbackItemId: string;
}

export function Comments({ feedbackItemId }: CommentsProps) {
  return (
    <div className="p-4 bg-slate-50/90 rounded-lg border-l-4 border-blue-400 h-full flex flex-col">
      <h4 className="text-slate-800 font-semibold text-sm mb-3">Commentary</h4>
      
      <div className="flex items-center justify-between flex-1">
        <p className="text-slate-600 text-sm">No comments yet...</p>
        
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:shadow-md hover:from-blue-200 hover:to-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        >
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add a Comment
        </button>
      </div>
    </div>
  );
} 
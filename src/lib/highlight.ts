import * as React from "react"

export function highlightText(text: string, searchStr: string): (string | React.ReactElement)[] | string {
  if (!searchStr) return text;
  
  const parts = text.split(new RegExp(`(${searchStr})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === searchStr.toLowerCase() ? 
      React.createElement('span', { key: i, className: 'bg-yellow-200' }, part) : 
      part
  );
} 
'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface TemplateProps {
  children: ReactNode
}

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div 
      className={`transition-all duration-150 ease-in-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2'
      }`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '150ms',
        transitionTimingFunction: 'ease-in-out'
      }}
    >
      {children}
    </div>
  )
} 
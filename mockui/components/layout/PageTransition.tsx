'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
}

export default function PageTransition({ children }: Props) {
  const pathname   = usePathname()
  const [visible, setVisible]     = useState(true)
  const [content, setContent]     = useState(children)
  const prevPath   = useRef(pathname)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (pathname === prevPath.current) {
      // same page — just update content in place (e.g. first render)
      setContent(children)
      return
    }

    // 1. Fade out current page (80 ms)
    setVisible(false)

    // 2. Swap content + fade in new page (after 90 ms)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      prevPath.current = pathname
      setContent(children)
      setVisible(true)
    }, 90)

    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Keep content fresh while on the same route (data changes, etc.)
  useEffect(() => {
    if (pathname === prevPath.current) {
      setContent(children)
    }
  }, [children, pathname])

  return (
    <div
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(8px)',
        transition: 'opacity 220ms cubic-bezier(0.4,0,0.2,1), transform 220ms cubic-bezier(0.4,0,0.2,1)',
        willChange: 'opacity, transform',
      }}
    >
      {content}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function NavProgress() {
  const pathname = usePathname()
  const [active, setActive]     = useState(false)
  const [width, setWidth]       = useState(0)
  const prevPath = useRef(pathname)
  const rafRef   = useRef<number | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    // Start bar
    setWidth(0)
    setActive(true)

    // Animate to 85% quickly
    let w = 0
    const grow = () => {
      w = w < 70 ? w + 8 : w < 85 ? w + 1.5 : w
      setWidth(w)
      if (w < 85) rafRef.current = requestAnimationFrame(grow)
    }
    rafRef.current = requestAnimationFrame(grow)

    // Complete after page settles
    timerRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current!)
      setWidth(100)
      setTimeout(() => setActive(false), 300)
    }, 350)

    return () => {
      cancelAnimationFrame(rafRef.current!)
      clearTimeout(timerRef.current)
    }
  }, [pathname])

  if (!active && width === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      height: 2,
      width: `${width}%`,
      background: 'linear-gradient(90deg, #1d4ed8, #1e3a8a)',
      boxShadow: '0 0 6px rgba(233,30,140,0.5)',
      transition: width === 100
        ? 'width 200ms ease, opacity 300ms ease 200ms'
        : 'width 60ms linear',
      opacity: width === 100 ? 0 : 1,
      borderRadius: '0 2px 2px 0',
      pointerEvents: 'none',
    }}/>
  )
}

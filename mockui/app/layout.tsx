import type { Metadata } from 'next'
import './globals.css'
import NavProgress from '@/components/layout/NavProgress'

export const metadata: Metadata = {
  title: 'RevenueGuard — Municipal Revenue Leakage Intelligence',
  description: 'AI-powered property tax fraud detection and revenue leakage intelligence for municipal corporations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavProgress />
        {children}
      </body>
    </html>
  )
}

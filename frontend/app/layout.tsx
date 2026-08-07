import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'RevenueGuard — Municipal Revenue Leakage Intelligence',
  description: 'AI-powered municipal revenue leakage detection and investigation system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

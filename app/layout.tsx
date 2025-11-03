import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from 'next'
import '../styles/globals.css'
import { Header } from '@/components/Header'
import { RightSidebar } from '@/components/RightSidebar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'GAILP - Global AI & Digital Policy Hub',
  description: 'Independent analysis of global digital policy',
}

// Force dynamic rendering for all pages to fix Lucide React icon issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthProvider>
          <Header />
          <RightSidebar />
          {children}
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}
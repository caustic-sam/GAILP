import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'World Papers - Global Digital Policy Hub',
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
      <body className="antialiased">{children}</body>
    </html>
  )
}
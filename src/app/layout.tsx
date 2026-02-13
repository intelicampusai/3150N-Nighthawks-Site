import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { Navbar } from '@/components/dashboard/Navbar'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VEX V5 Hub',
  description: 'Utility-first companion for VEX V5 Robotics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <Navbar />
        <main className="container mx-auto p-4 pb-20 md:pb-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}

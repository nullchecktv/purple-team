import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chicken Hatching Management System',
  description: 'Enterprise-grade AI-powered blockchain-ready solution for chicken egg incubation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter, Nunito_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const nunitoSans = Nunito_Sans({ 
  subsets: ['latin'],
  variable: '--font-nunito-sans',
})

export const metadata: Metadata = {
  title: 'ClínicaCRM - Lead Management Platform',
  description: 'Modern lead management platform for ophthalmology clinics and medical centers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunitoSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
} 
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Schichtplaner - Employee Scheduler",
  description: "Verwaltung von Mitarbeiterschichten und Zeitplänen",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#fbbf24",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Suspense fallback={<div>Lädt...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}

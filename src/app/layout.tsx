import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MiraiVPN - Le VPN du Futur',
  description: 'VPN à la carte dès 2€/mois. Ultra-rapide, sécurisé et privé.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <Navbar />
        <main className="pb-16">{children}</main>
      </body>
    </html>
  )
}

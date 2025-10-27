'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { ServerCard } from '@/components/ServerCard'
import { StatsBar } from '@/components/StatsBar'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface Server {
  id: string
  label: string
  country: string
  region: string
  capacity: number
  features: string[]
  publicLoad: number
  metrics?: {
    status: 'up' | 'down'
    pingMs: number
    users: number
    bandwidth: {
      downMbps: number
      upMbps: number
    }
  }
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers/list')
      if (response.ok) {
        const data = await response.json()
        setServers(data.servers || [])
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/servers/refresh', { method: 'POST' })
      await fetchServers()
    } catch (error) {
      console.error('Failed to refresh servers:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const totalServers = servers.length
  const onlineServers = servers.filter(s => s.metrics?.status === 'up').length
  const totalUsers = servers.reduce((sum, s) => sum + (s.metrics?.users || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-dark via-black to-ios-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-ios-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-ios-cyan/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>



      {/* Header */}
      <header className="relative z-10 text-center py-16 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-ios-white mb-6 animate-slide-up">
          Nos serveurs
        </h1>
        <p className="text-xl text-ios-gray max-w-2xl mx-auto animate-fade-in delay-300">
          Découvrez notre réseau mondial de serveurs VPN haute performance
        </p>
      </header>

      {/* Stats Bar */}
      <section className="relative z-10 px-6 mb-8">
        <StatsBar
          totalServers={totalServers}
          onlineServers={onlineServers}
          totalUsers={totalUsers}
        />
      </section>

      {/* Controls */}
      <section className="relative z-10 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-ios-gray text-ios-white px-3 py-1">
              <Wifi className="w-4 h-4 mr-2" />
              {onlineServers} en ligne
            </Badge>
            <Badge variant="outline" className="border-ios-gray text-ios-white px-3 py-1">
              <WifiOff className="w-4 h-4 mr-2" />
              {totalServers - onlineServers} hors ligne
            </Badge>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-ios-gray/20 hover:bg-ios-gray/30 text-ios-white border border-ios-gray/30 rounded-2xl px-4 py-2"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </section>

      {/* Servers Grid */}
      <main className="relative z-10 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass border-ios-gray/20 rounded-3xl p-6 animate-pulse">
                  <div className="h-4 bg-ios-gray/20 rounded mb-4"></div>
                  <div className="h-6 bg-ios-gray/20 rounded mb-2"></div>
                  <div className="h-4 bg-ios-gray/20 rounded"></div>
                </Card>
              ))}
            </div>
          ) : servers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map((server, index) => (
                <div
                  key={server.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ServerCard server={server} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="glass border-ios-gray/20 rounded-3xl p-8 text-center max-w-md mx-auto">
              <CardContent className="p-0">
                <WifiOff className="w-16 h-16 text-ios-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ios-white mb-2">Aucun serveur disponible</h3>
                <p className="text-ios-gray">Les serveurs sont temporairement indisponibles. Veuillez réessayer plus tard.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-ios-gray">
        <p>&copy; 2024 MiraiVPN. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

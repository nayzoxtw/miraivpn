import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Server, Users, Zap, Globe, Wifi, WifiOff } from 'lucide-react';

interface Server {
  id: string;
  label: string;
  country: string;
  region: string;
  capacity: number;
  features: string[];
  publicLoad: number;
  metrics?: {
    status: 'up' | 'down';
    pingMs: number;
    users: number;
    bandwidth: {
      downMbps: number;
      upMbps: number;
    };
  };
}

interface ServerCardProps {
  server: Server;
}

export function ServerCard({ server }: ServerCardProps) {
  const isOnline = server.metrics?.status === 'up';
  const loadPercentage = server.publicLoad;
  const getLoadColor = (load: number) => {
    if (load < 30) return 'text-green-400';
    if (load < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="glass border-ios-gray/20 rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-glow">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-ios-white mb-1">
              {server.label}
            </h3>
            <p className="text-ios-gray text-sm">
              {server.country} • {server.region}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <Badge variant="outline" className={`text-xs border-ios-gray/30 ${
              isOnline ? 'text-green-400' : 'text-red-400'
            }`}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ios-gray">Charge</span>
            <span className={`text-sm font-medium ${getLoadColor(loadPercentage)}`}>
              {loadPercentage}%
            </span>
          </div>

          {server.metrics && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ios-gray">Utilisateurs</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-ios-gray" />
                  <span className="text-sm font-medium text-ios-white">
                    {server.metrics.users}/{server.capacity}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-ios-gray">Latence</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-ios-gray" />
                  <span className="text-sm font-medium text-ios-white">
                    {server.metrics.pingMs}ms
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-ios-gray">Bande passante</span>
                <span className="text-sm font-medium text-ios-white">
                  ↓{server.metrics.bandwidth.downMbps} ↑{server.metrics.bandwidth.upMbps} Mbps
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {server.features.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs border-ios-gray/30 text-ios-gray">
              {feature}
            </Badge>
          ))}
          {server.features.length > 2 && (
            <Badge variant="outline" className="text-xs border-ios-gray/30 text-ios-gray">
              +{server.features.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card } from '@/components/ui/Card';
import { Server, Users, Zap, Globe } from 'lucide-react';

interface StatsBarProps {
  totalServers: number;
  onlineServers: number;
  totalUsers: number;
}

export function StatsBar({ totalServers, onlineServers, totalUsers }: StatsBarProps) {
  return (
    <Card className="glass border-ios-gray/20 rounded-3xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Server className="w-5 h-5 text-ios-gray mr-2" />
            <span className="text-2xl font-bold text-ios-white">{totalServers}</span>
          </div>
          <p className="text-sm text-ios-gray">Serveurs</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Globe className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-2xl font-bold text-ios-white">{onlineServers}</span>
          </div>
          <p className="text-sm text-ios-gray">En ligne</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-ios-blue mr-2" />
            <span className="text-2xl font-bold text-ios-white">{totalUsers}</span>
          </div>
          <p className="text-sm text-ios-gray">Utilisateurs actifs</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-2xl font-bold text-ios-white">42ms</span>
          </div>
          <p className="text-sm text-ios-gray">Latence moyenne</p>
        </div>
      </div>
    </Card>
  );
}

import { api } from './api';

export interface VpsServer {
  id: string;
  name: string;
  ip: string;
  region: string;
  active_users: number;
  max_users: number;
  cpu_load: number;
  bw_mbps: number;
  status: string;
  last_ping: Date | null;
}

export interface VpsMetrics {
  server_id: string;
  region: string;
  users: {
    basic: number;
    premium: number;
    vip: number;
  };
  max: {
    basic: number;
    premium: number;
    vip: number;
  };
  bw: number;
  cpu: number;
  ping: number;
  status: 'up' | 'down';
}

export class VpsService {
  static async getAllServers(): Promise<VpsServer[]> {
    const response = await api.getServers();
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch servers');
    }
    return response.data?.servers || [];
  }

  static async getServerById(id: string): Promise<VpsServer | null> {
    const servers = await this.getAllServers();
    return servers.find(server => server.id === id) || null;
  }

  static async updateServerMetrics(serverId: string, metrics: Partial<VpsMetrics>): Promise<void> {
    // This would need a backend endpoint to update server metrics
    console.warn('updateServerMetrics not implemented - needs backend endpoint');
  }

  static async chooseVpsForUser(userId: string, plan: 'basic' | 'premium' | 'vip', region: string): Promise<VpsServer> {
    const servers = await this.getAllServers();

    const availableServers = servers.filter(server =>
      server.region === region && server.status === 'online'
    );

    if (availableServers.length === 0) {
      throw new Error('No servers available in this region');
    }

    // Calculate scores for each server
    const scoredServers = availableServers.map((server: any) => {
      const usersRatio = server.active_users / server.max_users;
      const score = (1 - usersRatio) * 0.5 + (1 - server.cpu_load) * 0.3 + (1 - (server.last_ping ? 0.1 : 0.5)) * 0.2;
      return { server, score };
    });

    // Sort by score descending, then by active_users ascending
    scoredServers.sort((a: any, b: any) => {
      if (Math.abs(a.score - b.score) > 0.01) {
        return b.score - a.score;
      }
      return a.server.active_users - b.server.active_users;
    });

    return scoredServers[0].server;
  }

  static async createPeer(userId: string, plan: 'basic' | 'premium' | 'vip', quotaGb: number): Promise<{
    publicKey: string;
    endpoint: string;
    config: string;
  }> {
    // This would normally call the VPS API
    // For now, return mock data
    const publicKey = 'mock-public-key-' + Date.now();
    const endpoint = 'mock-endpoint:51820';

    const config = `[Interface]
PrivateKey = mock-private-key
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = ${publicKey}
Endpoint = ${endpoint}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    return {
      publicKey,
      endpoint,
      config
    };
  }

  static async assignUserToVps(userId: string, vpsId: string, plan: 'basic' | 'premium' | 'vip', wireguardConfig: string): Promise<void> {
    // This would need a backend endpoint to assign user to VPS
    console.warn('assignUserToVps not implemented - needs backend endpoint');
  }

  static async reportSuspiciousActivity(vpsId: string, userId: string, reason: string, logRef?: string): Promise<void> {
    // This would need a backend endpoint to report suspicious activity
    console.warn('reportSuspiciousActivity not implemented - needs backend endpoint');
  }

  static async getUserSubscription(userId: string) {
    // This would need a backend endpoint to get user subscription
    console.warn('getUserSubscription not implemented - needs backend endpoint');
    return null;
  }

  static async updateUsage(userId: string, usedGb: number): Promise<void> {
    // This would need a backend endpoint to update usage
    console.warn('updateUsage not implemented - needs backend endpoint');
  }
}

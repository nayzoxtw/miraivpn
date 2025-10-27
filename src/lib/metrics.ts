import { z } from 'zod';
import { getPrivateConfig, getPublicConfig, getAgentById, type PublicServer, type PrivateAgent } from './config';
import { cache } from './cache';

// Agent response schema
const AgentResponseSchema = z.object({
  id: z.string(),
  ts: z.string(),
  status: z.string(),
  pingMs: z.number(),
  users: z.number(),
  bandwidth: z.object({
    downMbps: z.number(),
    upMbps: z.number(),
  }),
  wg: z.object({
    peers: z.number(),
    rxBytes: z.number(),
    txBytes: z.number(),
  }),
});

type AgentResponse = z.infer<typeof AgentResponseSchema>;

// Public server with metrics
export type ServerWithMetrics = PublicServer & {
  publicLoad: {
    users: number;
    bandwidthMbps: number;
    pingMs: number | null;
    status: string;
  };
};

// Poll a single agent
async function pollAgent(agent: PrivateAgent): Promise<AgentResponse | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

  try {
    const url = `http://${agent.ip}:${agent.metricsPort}/metrics`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${agent.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const validated = AgentResponseSchema.parse(data);
    return validated;
  } catch (error) {
    console.error(`Failed to poll agent ${agent.id}:`, error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Poll all agents in parallel
export async function pollAllAgents(): Promise<AgentResponse[]> {
  const privateConfig = getPrivateConfig();
  const promises = privateConfig.agents.map(pollAgent);
  const results = await Promise.all(promises);
  return results.filter((result): result is AgentResponse => result !== null);
}

// Merge public config with live metrics
export async function getServersWithMetrics(forceRefresh = false): Promise<ServerWithMetrics[]> {
  const cacheKey = 'metrics:v1';
  const ttlMs = 30 * 1000; // 30 seconds

  if (!forceRefresh) {
    const cached = cache.get<ServerWithMetrics[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const publicConfig = getPublicConfig();
  const agentResponses = await pollAllAgents();

  const serversWithMetrics: ServerWithMetrics[] = publicConfig.servers.map(server => {
    const agentResponse = agentResponses.find(resp => resp.id === server.id);

    if (agentResponse) {
      return {
        ...server,
        publicLoad: {
          users: agentResponse.users,
          bandwidthMbps: agentResponse.bandwidth.downMbps + agentResponse.bandwidth.upMbps,
          pingMs: agentResponse.pingMs,
          status: agentResponse.status,
        },
      };
    } else {
      // Agent unreachable, keep existing or set to down
      return {
        ...server,
        publicLoad: {
          ...server.publicLoad,
          status: 'down',
          pingMs: null,
        },
      };
    }
  });

  cache.set(cacheKey, serversWithMetrics, ttlMs);
  return serversWithMetrics;
}

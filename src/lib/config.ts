import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Schemas for validation
const PublicServerSchema = z.object({
  id: z.string(),
  label: z.string(),
  country: z.string(),
  region: z.string(),
  capacity: z.number(),
  features: z.array(z.string()),
  publicLoad: z.object({
    users: z.number(),
    bandwidthMbps: z.number(),
    pingMs: z.number().nullable(),
    status: z.string(),
  }),
});

const PublicConfigSchema = z.object({
  version: z.number(),
  updatedAt: z.string(),
  servers: z.array(PublicServerSchema),
});

const PrivateAgentSchema = z.object({
  id: z.string(),
  ip: z.string(),
  metricsPort: z.number(),
  token: z.string(),
  capacity: z.number(),
  wgInterface: z.string(),
});

const PrivateConfigSchema = z.object({
  version: z.number(),
  centralId: z.string(),
  agents: z.array(PrivateAgentSchema),
});

// Types
export type PublicServer = z.infer<typeof PublicServerSchema>;
export type PublicConfig = z.infer<typeof PublicConfigSchema>;
export type PrivateAgent = z.infer<typeof PrivateAgentSchema>;
export type PrivateConfig = z.infer<typeof PrivateConfigSchema>;

// Load and validate configs
function loadConfig<T>(filepath: string, schema: z.ZodSchema<T>): T {
  const content = fs.readFileSync(filepath, 'utf-8');
  const data = JSON.parse(content);
  return schema.parse(data);
}

// Resolve env vars in private config
function resolveEnvVars(obj: any): any {
  if (typeof obj === 'string' && obj.startsWith('env:')) {
    const envKey = obj.slice(4);
    const value = process.env[envKey];
    if (!value) {
      throw new Error(`Environment variable ${envKey} not set`);
    }
    return value;
  }
  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVars);
  }
  if (obj && typeof obj === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveEnvVars(value);
    }
    return resolved;
  }
  return obj;
}

// Cached configs
let publicConfig: PublicConfig | null = null;
let privateConfig: PrivateConfig | null = null;

export function getPublicConfig(): PublicConfig {
  if (!publicConfig) {
    const filepath = path.join(process.cwd(), 'configs', 'servers.public.json');
    publicConfig = loadConfig(filepath, PublicConfigSchema);
  }
  return publicConfig;
}

export function getPrivateConfig(): PrivateConfig {
  if (!privateConfig) {
    const filepath = path.join(process.cwd(), 'configs', 'servers.private.json');
    const rawConfig = loadConfig(filepath, PrivateConfigSchema);
    privateConfig = resolveEnvVars(rawConfig) as PrivateConfig;
  }
  return privateConfig;
}

// Get agent by ID
export function getAgentById(id: string): PrivateAgent | undefined {
  return getPrivateConfig().agents.find(agent => agent.id === id);
}

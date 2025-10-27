export interface Plan {
  id: 'basic' | 'premium' | 'vip';
  name: string;
  price: number;
  currency: string;
  interval: 'month';
  features: string[];
  maxDevices: number;
  bandwidthLimit?: string;
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Access to all servers',
      'WireGuard protocol',
      '1 device',
      'No logs policy',
      '24/7 support',
    ],
    maxDevices: 1,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Access to all servers',
      'WireGuard protocol',
      '5 devices',
      'No logs policy',
      'Priority support',
      'Dedicated IP (optional)',
    ],
    maxDevices: 5,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Access to all servers',
      'WireGuard protocol',
      'Unlimited devices',
      'No logs policy',
      'Dedicated support',
      'Dedicated IP included',
      'Custom configurations',
    ],
    maxDevices: -1, // unlimited
  },
];

export function getPlanById(id: string): Plan | undefined {
  return plans.find(plan => plan.id === id);
}

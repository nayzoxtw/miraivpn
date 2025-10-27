import { api } from './api';

export interface StripeCheckoutSession {
  id: string;
  url: string;
  status: string;
}

export class StripeService {
  static async createCheckoutSession(planId: string): Promise<StripeCheckoutSession> {
    const response = await api.createCheckoutSession(planId);

    if (!response.success) {
      throw new Error(response.error || 'Failed to create checkout session');
    }

    return {
      id: response.data?.id || 'temp',
      url: response.data!.url,
      status: 'pending',
    };
  }

  static async getCustomerPortalUrl(): Promise<string> {
    // This would need a new backend endpoint
    // For now, return a placeholder
    console.warn('getCustomerPortalUrl not implemented - needs backend endpoint');
    return `${process.env.NEXT_PUBLIC_APP_URL}/settings`;
  }
}

// Legacy functions for backward compatibility
export async function createCheckoutSession(plan: 'basic' | 'premium' | 'vip') {
  const planMapping: { [key: string]: string } = {
    basic: 'basic',
    premium: 'premium',
    vip: 'vip',
  };

  const session = await StripeService.createCheckoutSession(planMapping[plan]);
  return { url: session.url };
}

export async function handleWebhook(rawBody: string, signature: string) {
  // Webhook handling is now done by PHP backend
  console.log('Webhook received - should be handled by PHP backend');
  return { received: true };
}

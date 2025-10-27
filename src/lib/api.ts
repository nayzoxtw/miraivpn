const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    sponsorUsername?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', response.data.token);
      }
    }

    return response;
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resetPassword(data: { email: string }) {
    return this.request('/auth/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Stripe endpoints
  async createCheckoutSession(planId: string) {
    return this.request<{ url: string }>('/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: planId }),
    });
  }

  // VPS endpoints
  async getServers() {
    return this.request<{ servers: any[] }>('/servers/list');
  }

  async getVpsStatus() {
    return this.request<{ servers: any[] }>('/vps/status');
  }

  async chooseVps(data: { user_id: string; region?: string }) {
    return this.request<{ vps: any }>('/vps/choose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmVps(data: { user_id: string; vps_id: string }) {
    return this.request<{ config: string }>('/vps/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVpsConfig(userId: string) {
    return this.request<{ config: string }>(`/vps/config?user_id=${userId}`);
  }

  // User endpoints
  async getUserSettings(userId: string) {
    return this.request('/user/settings', {
      method: 'GET',
    });
  }

  async updateUserSettings(data: any) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }
}

export const api = new ApiClient();

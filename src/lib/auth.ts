import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import bcrypt from 'bcrypt';
import { api } from './api';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  username: string;
  email: string;
  language: string;
  balance_credits: number;
  sponsor_id?: string;
  email_verified: boolean;
  twofa_secret?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload?.userId) return null;

    // For now, return user from token payload
    // In a real implementation, you might want to validate with backend
    return {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      language: 'fr',
      balance_credits: 0,
      email_verified: true,
    };
  }

  static generate2FASecret(): { secret: string; otpauth_url: string } {
    const secret = speakeasy.generateSecret({
      name: 'MiraiVPN',
      issuer: 'MiraiVPN',
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url!,
    };
  }

  static async generate2FAQR(secret: string, username: string): Promise<string> {
    const otpauth_url = `otpauth://totp/MiraiVPN:${username}?secret=${secret}&issuer=MiraiVPN`;
    return qrcode.toDataURL(otpauth_url);
  }

  static verify2FA(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (30 seconds) tolerance
    });
  }

  static async createUser(data: {
    username: string;
    email: string;
    password: string;
    sponsor_id?: string;
  }): Promise<User> {
    const response = await api.register(data);

    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }

    // Return a basic user object - backend will send verification email
    return {
      id: 'temp', // Will be set after verification
      username: data.username,
      email: data.email,
      language: 'fr',
      balance_credits: 0,
      email_verified: false,
    };
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const response = await api.login({ email, password });

    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    if (!response.data?.user) {
      return null;
    }

    return {
      id: response.data.user.id,
      username: response.data.user.username,
      email: response.data.user.email,
      language: response.data.user.language || 'fr',
      balance_credits: response.data.user.balance_credits || 0,
      sponsor_id: response.data.user.sponsor_id,
      email_verified: response.data.user.email_verified || false,
      twofa_secret: response.data.user.twofa_secret,
    };
  }

  static generateEmailToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static async verifyEmailToken(token: string): Promise<boolean> {
    const response = await api.verifyEmail(token);
    return response.success;
  }

  static async update2FASecret(userId: string, secret: string | null): Promise<void> {
    // This would need a new backend endpoint
    // For now, we'll handle this in user settings
    console.warn('update2FASecret not implemented - needs backend endpoint');
  }

  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    // This would need a new backend endpoint
    console.warn('updatePassword not implemented - needs backend endpoint');
  }

  static async logActivity(userId: string | null, type: string, message: string): Promise<void> {
    // This could be handled by backend logging
    console.log(`[${type}] ${message}`);
  }

  // New methods for PHP backend integration
  static async register(data: {
    username: string;
    email: string;
    password: string;
    sponsorUsername?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    return this.createUser(data).then(user => ({
      user,
      tokens: this.generateTokens(user),
    }));
  }

  static async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.authenticateUser(email, password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }
}

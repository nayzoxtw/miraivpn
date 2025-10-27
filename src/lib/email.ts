import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject: 'Vérifie ton adresse MiraiVPN',
      html: `
        <div style="background:#000;color:#fff;padding:30px;border-radius:12px;font-family:sans-serif;">
          <h2 style="color:#00ffff;">Bienvenue chez 未来VPN</h2>
          <p>Merci d'avoir créé un compte.</p>
          <p>Clique sur le lien ci-dessous pour vérifier ton adresse :</p>
          <a href="${verifyUrl}"
             style="background:#00ffff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:20px 0;">
             Vérifier mon adresse
          </a>
          <p style="font-size:12px;color:#666;margin-top:20px;">
            Si le bouton ne fonctionne pas, copie ce lien : ${verifyUrl}
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw - we don't want to crash the registration
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to,
      subject: 'Réinitialise ton mot de passe MiraiVPN',
      html: `
        <div style="background:#000;color:#fff;padding:30px;border-radius:12px;font-family:sans-serif;">
          <h2 style="color:#00ffff;">Réinitialisation de mot de passe</h2>
          <p>Tu as demandé à réinitialiser ton mot de passe.</p>
          <p>Clique sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}"
             style="background:#00ffff;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:20px 0;">
             Réinitialiser mon mot de passe
          </a>
          <p style="font-size:12px;color:#666;margin-top:20px;">
            Si le bouton ne fonctionne pas, copie ce lien : ${resetUrl}
          </p>
          <p style="font-size:12px;color:#666;">
            Ce lien expire dans 15 minutes.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Don't throw - we don't want to crash the reset request
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

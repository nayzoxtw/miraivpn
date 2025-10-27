"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { WaterButton } from "@/components/ui/WaterButton";
import BackgroundFX from "@/components/ui/BackgroundFX";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <BackgroundFX />
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Email Verification</h1>

          {status === 'loading' && (
            <div className="text-neutral-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Verifying your email...
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <p className="text-white mb-6">{message}</p>
              <WaterButton onClick={() => router.push('/login')}>
                Go to Login
              </WaterButton>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-red-400 text-6xl mb-4">✗</div>
              <p className="text-white mb-6">{message}</p>
              <WaterButton onClick={() => router.push('/register')}>
                Back to Register
              </WaterButton>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getPlanById } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    const session = await createCheckoutSession(planId as 'basic' | 'premium' | 'vip');

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

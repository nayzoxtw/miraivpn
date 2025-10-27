import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    const event = await handleWebhook(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // TODO: Create/update subscription in database
        console.log('Checkout session completed:', event.data.object.id);
        break;
      case 'invoice.payment_succeeded':
        // TODO: Update subscription status
        console.log('Payment succeeded for invoice:', event.data.object.id);
        break;
      case 'invoice.payment_failed':
        // TODO: Handle failed payment
        console.log('Payment failed for invoice:', event.data.object.id);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

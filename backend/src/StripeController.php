<?php
namespace MiraiVPN;

use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Checkout\Session;

class StripeController {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
    }

    public function checkout(array $data): array {
        $userId = $data['user_id'];
        $plan = $data['plan'];
        $region = $data['region'];

        // Verify user exists
        $user = $this->db->query("SELECT id FROM users WHERE id = ?", [$userId]);
        if (empty($user)) {
            return ['error' => 'User not found'];
        }

        $prices = [
            'basic' => 'price_basic_id', // Replace with actual Stripe price IDs
            'premium' => 'price_premium_id',
            'vip' => 'price_vip_id'
        ];

        if (!isset($prices[$plan])) {
            return ['error' => 'Invalid plan'];
        }

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $prices[$plan],
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => $_ENV['APP_URL'] . '/thanks?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $_ENV['APP_URL'] . '/pricing',
            'metadata' => [
                'user_id' => $userId,
                'plan' => $plan,
                'region' => $region
            ]
        ]);

        return ['success' => true, 'url' => $session->url];
    }

    public function handleWebhook($request): array {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $_ENV['STRIPE_WEBHOOK_SECRET']);
        } catch (\UnexpectedValueException $e) {
            return ['error' => 'Invalid payload'];
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return ['error' => 'Invalid signature'];
        }

        // Check if event already processed
        $existing = $this->db->query("SELECT id FROM stripe_events WHERE id = ?", [$event->id]);
        if (!empty($existing)) {
            return ['success' => true, 'message' => 'Event already processed'];
        }

        // Record event
        $this->db->execute("INSERT INTO stripe_events (id, type) VALUES (?, ?)", [$event->id, $event->type]);

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleCheckoutCompleted($session);
                break;
            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                $this->handlePaymentSucceeded($invoice);
                break;
            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $this->handlePaymentFailed($invoice);
                break;
            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $this->handleSubscriptionDeleted($subscription);
                break;
        }

        return ['success' => true];
    }

    private function handleCheckoutCompleted($session): void {
        $userId = $session->metadata->user_id;
        $plan = $session->metadata->plan;
        $region = $session->metadata->region;

        // Create subscription
        $this->db->execute("INSERT INTO subscriptions (id, user_id, plan, region, stripe_sub_id, status, started_at) VALUES (?, ?, ?, ?, ?, 'incomplete', NOW())", [
            $this->generateId(), $userId, $plan, $region, $session->subscription
        ]);
    }

    private function handlePaymentSucceeded($invoice): void {
        $subscriptionId = $invoice->subscription;

        // Update subscription status and dates
        $this->db->execute("UPDATE subscriptions SET status = 'active', started_at = NOW(), ends_at = DATE_ADD(NOW(), INTERVAL 1 MONTH) WHERE stripe_sub_id = ?", [$subscriptionId]);
    }

    private function handlePaymentFailed($invoice): void {
        $subscriptionId = $invoice->subscription;

        // Update subscription status
        $this->db->execute("UPDATE subscriptions SET status = 'past_due' WHERE stripe_sub_id = ?", [$subscriptionId]);
    }

    private function handleSubscriptionDeleted($subscription): void {
        // Update subscription status
        $this->db->execute("UPDATE subscriptions SET status = 'canceled' WHERE stripe_sub_id = ?", [$subscription->id]);
    }

    private function generateId(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}

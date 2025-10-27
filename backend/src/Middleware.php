<?php
namespace MiraiVPN;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Middleware {
    private Database $db;
    private array $allowedOrigins;
    private string $apiKey;
    private array $rateLimitStore = [];

    public function __construct(Database $db) {
        $this->db = $db;
        $this->allowedOrigins = explode(',', $_ENV['ALLOWED_ORIGINS']);
        $this->apiKey = $_ENV['X_API_KEY'];
    }

    public function handle(Request $request): ?Response {
        // CORS headers
        $origin = $request->headers->get('Origin');
        if ($origin && in_array($origin, $this->allowedOrigins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
        header('Access-Control-Allow-Credentials: true');

        if ($request->getMethod() === 'OPTIONS') {
            return new Response('', 200);
        }

        // Rate limiting (simple in-memory, production should use Redis)
        if (!$this->checkRateLimit($request)) {
            return new Response(json_encode(['error' => 'Rate limit exceeded']), 429, ['Content-Type' => 'application/json']);
        }

        // Skip API key check for Stripe webhook
        if ($request->getPathInfo() !== '/api/stripe/webhook') {
            if (!$this->validateApiKey($request)) {
                return new Response(json_encode(['error' => 'Invalid API key']), 403, ['Content-Type' => 'application/json']);
            }
        }

        // JWT validation for protected routes
        if ($this->requiresAuth($request->getPathInfo())) {
            $user = $this->validateJwt($request);
            if (!$user) {
                return new Response(json_encode(['error' => 'Invalid or expired token']), 401, ['Content-Type' => 'application/json']);
            }
            // Store user in request attributes for controllers
            $request->attributes->set('user', $user);
        }

        return null; // Continue to controller
    }

    private function checkRateLimit(Request $request): bool {
        $key = $request->getClientIp() . ':' . $request->getPathInfo();
        $now = time();
        $window = 60; // 1 minute
        $limit = 10; // 10 requests per minute

        if (!isset($this->rateLimitStore[$key])) {
            $this->rateLimitStore[$key] = [];
        }

        // Clean old entries
        $this->rateLimitStore[$key] = array_filter($this->rateLimitStore[$key], function($timestamp) use ($now, $window) {
            return $timestamp > ($now - $window);
        });

        if (count($this->rateLimitStore[$key]) >= $limit) {
            return false;
        }

        $this->rateLimitStore[$key][] = $now;
        return true;
    }

    private function validateApiKey(Request $request): bool {
        $apiKey = $request->headers->get('X-API-Key');
        return $apiKey === $this->apiKey;
    }

    private function requiresAuth(string $path): bool {
        $publicRoutes = [
            '/api/auth/register',
            '/api/auth/login',
            '/api/auth/verify',
            '/api/auth/reset-request',
            '/api/auth/reset',
            '/api/stripe/webhook',
            '/api/health'
        ];

        foreach ($publicRoutes as $route) {
            if (strpos($path, $route) === 0) {
                return false;
            }
        }

        return true;
    }

    private function validateJwt(Request $request): ?array {
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}

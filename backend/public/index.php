<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use MiraiVPN\Database;
use MiraiVPN\Middleware;
use MiraiVPN\AuthController;
use MiraiVPN\StripeController;
use MiraiVPN\VPSController;
use MiraiVPN\UserController;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Initialize database and run migrations if needed
$db = new Database();
$db->runMigrations();

// Initialize middleware
$middleware = new Middleware($db);

// Get request
$request = Request::createFromGlobals();

// Apply middleware
$middlewareResponse = $middleware->handle($request);
if ($middlewareResponse) {
    $middlewareResponse->send();
    exit;
}

// Routing
$path = $request->getPathInfo();
$method = $request->getMethod();
$user = $request->attributes->get('user');

$response = new Response();
$response->headers->set('Content-Type', 'application/json');

try {
    $result = null;

    if ($path === '/api/health' && $method === 'GET') {
        $result = ['ok' => true, 'version' => '1.0.0'];
    } elseif ($path === '/api/auth/register' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $controller = new AuthController($db);
        $result = $controller->register($data);
    } elseif ($path === '/api/auth/verify' && $method === 'GET') {
        $token = $request->query->get('token');
        $controller = new AuthController($db);
        $result = $controller->verifyEmail(['token' => $token]);
    } elseif ($path === '/api/auth/login' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $controller = new AuthController($db);
        $result = $controller->login($data);
    } elseif ($path === '/api/auth/refresh' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $controller = new AuthController($db);
        $result = $controller->refresh($data);
    } elseif ($path === '/api/auth/reset-request' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $controller = new AuthController($db);
        $result = $controller->resetRequest($data);
    } elseif ($path === '/api/auth/reset' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $controller = new AuthController($db);
        $result = $controller->reset($data);
    } elseif ($path === '/api/stripe/checkout' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $data['user_id'] = $user['user_id'];
        $controller = new StripeController($db);
        $result = $controller->checkout($data);
    } elseif ($path === '/api/stripe/webhook' && $method === 'POST') {
        $controller = new StripeController($db);
        $result = $controller->handleWebhook($request);
    } elseif ($path === '/api/vps/status' && $method === 'GET') {
        $controller = new VPSController($db);
        $result = $controller->getStatus();
    } elseif ($path === '/api/vps/choose' && $method === 'POST') {
        $data = json_decode($request->getContent(), true);
        $data['user_id'] = $user['user_id'];
        $controller = new VPSController($db);
        $result = $controller->choose($data);
    } elseif ($path === '/api/vps/confirm' && $method === 'POST') {
        $data = ['user_id' => $user['user_id']];
        $controller = new VPSController($db);
        $result = $controller->confirm($data);
    } elseif ($path === '/api/vps/config' && $method === 'GET') {
        $data = ['user_id' => $user['user_id']];
        $controller = new VPSController($db);
        $result = $controller->getConfig($data);
    } else {
        $result = ['error' => 'Not found'];
        $response->setStatusCode(404);
    }

    if ($result) {
        $response->setContent(json_encode($result));
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    $response->setContent(json_encode(['error' => 'Internal server error']));
    $response->setStatusCode(500);
}

$response->send();

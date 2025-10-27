<?php
namespace MiraiVPN;

class Utils {
    public static function validateEmail(string $email): bool {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function sanitizeInput(string $input): string {
        return htmlspecialchars(strip_tags(trim($input)));
    }

    public static function generateToken(int $length = 32): string {
        return bin2hex(random_bytes($length));
    }

    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    public static function getUserFromToken(string $token): ?array {
        try {
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($_ENV['JWT_SECRET'], 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}

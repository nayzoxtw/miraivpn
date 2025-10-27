<?php
namespace MiraiVPN;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController {
    private Database $db;
    private Mailer $mailer;

    public function __construct(Database $db) {
        $this->db = $db;
        $this->mailer = new Mailer();
    }

    public function register(array $data): array {
        $email = trim($data['email']);
        $password = $data['password'];

        // Validation
        if (empty($email) || empty($password)) {
            return ['error' => 'Email and password required'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Invalid email'];
        }

        if (strlen($password) < 8) {
            return ['error' => 'Password too short'];
        }

        // Check if user exists
        $existing = $this->db->query("SELECT id FROM users WHERE email = ?", [$email]);
        if (!empty($existing)) {
            return ['error' => 'User already exists'];
        }

        // Generate user ID and hash password
        $userId = $this->generateId();
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + (15 * 60)); // 15 minutes

        // Insert user
        $this->db->execute("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [
            $userId, $email, $hash
        ]);

        // Insert verification token
        $this->db->execute("INSERT INTO verification_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)", [
            $this->generateId(), $userId, $tokenHash, $expiresAt
        ]);

        // Send verification email
        $this->mailer->sendVerificationEmail($email, $token);

        return ['success' => true, 'message' => 'Registration successful, check your email'];
    }

    public function verifyEmail(array $data): array {
        $token = $data['token'];
        $tokenHash = hash('sha256', $token);

        $tokenData = $this->db->query("SELECT user_id, expires_at FROM verification_tokens WHERE token_hash = ?", [$tokenHash]);
        if (empty($tokenData)) {
            return ['error' => 'Invalid token'];
        }

        $tokenData = $tokenData[0];
        if (strtotime($tokenData['expires_at']) < time()) {
            return ['error' => 'Token expired'];
        }

        $this->db->execute("UPDATE users SET email_verified = 1 WHERE id = ?", [$tokenData['user_id']]);
        $this->db->execute("DELETE FROM verification_tokens WHERE token_hash = ?", [$tokenHash]);

        return ['success' => true, 'message' => 'Email verified'];
    }

    public function login(array $data): array {
        $email = trim($data['email']);
        $password = $data['password'];

        $user = $this->db->query("SELECT id, email, password_hash, email_verified FROM users WHERE email = ?", [$email]);
        if (empty($user)) {
            return ['error' => 'Invalid credentials'];
        }

        $user = $user[0];

        if (!password_verify($password, $user['password_hash'])) {
            return ['error' => 'Invalid credentials'];
        }

        if (!$user['email_verified']) {
            return ['error' => 'Email not verified'];
        }

        $payload = [
            'iss' => $_ENV['APP_URL'],
            'aud' => $_ENV['APP_URL'],
            'iat' => time(),
            'exp' => time() + ($_ENV['JWT_EXP_MIN'] * 60),
            'user_id' => $user['id']
        ];

        $jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        return ['success' => true, 'token' => $jwt, 'user' => [
            'id' => $user['id'],
            'email' => $user['email']
        ]];
    }

    public function refresh(array $data): array {
        $refreshToken = $data['refresh_token'];

        try {
            $decoded = JWT::decode($refreshToken, new Key($_ENV['JWT_SECRET'], 'HS256'));
            $userId = $decoded->user_id;

            // Verify user still exists and is verified
            $user = $this->db->query("SELECT id, email_verified FROM users WHERE id = ?", [$userId]);
            if (empty($user) || !$user[0]['email_verified']) {
                return ['error' => 'Invalid refresh token'];
            }

            $payload = [
                'iss' => $_ENV['APP_URL'],
                'aud' => $_ENV['APP_URL'],
                'iat' => time(),
                'exp' => time() + ($_ENV['JWT_EXP_MIN'] * 60),
                'user_id' => $userId
            ];

            $newToken = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

            return ['success' => true, 'token' => $newToken];
        } catch (\Exception $e) {
            return ['error' => 'Invalid refresh token'];
        }
    }

    public function resetRequest(array $data): array {
        $email = trim($data['email']);

        $user = $this->db->query("SELECT id FROM users WHERE email = ?", [$email]);
        if (empty($user)) {
            return ['error' => 'User not found'];
        }

        $userId = $user[0]['id'];
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + (15 * 60)); // 15 minutes

        $this->db->execute("INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)", [
            $this->generateId(), $userId, $tokenHash, $expiresAt
        ]);

        $this->mailer->sendPasswordResetEmail($email, $token);

        return ['success' => true, 'message' => 'Password reset email sent'];
    }

    public function reset(array $data): array {
        $token = $data['token'];
        $newPassword = $data['new_password'];
        $tokenHash = hash('sha256', $token);

        if (strlen($newPassword) < 8) {
            return ['error' => 'Password too short'];
        }

        $resetData = $this->db->query("SELECT user_id, expires_at, used FROM password_resets WHERE token_hash = ? AND used = 0", [$tokenHash]);
        if (empty($resetData)) {
            return ['error' => 'Invalid or used token'];
        }

        $resetData = $resetData[0];
        if (strtotime($resetData['expires_at']) < time()) {
            return ['error' => 'Token expired'];
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->db->execute("UPDATE users SET password_hash = ? WHERE id = ?", [$hash, $resetData['user_id']]);
        $this->db->execute("UPDATE password_resets SET used = 1 WHERE token_hash = ?", [$tokenHash]);

        return ['success' => true, 'message' => 'Password reset successful'];
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

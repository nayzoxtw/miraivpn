<?php
namespace MiraiVPN;

class UserController {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
    }

    public function getProfile(string $userId): array {
        $user = $this->db->query("SELECT id, username, email, balance_credits, language FROM users WHERE id = ?", [$userId]);
        if (empty($user)) {
            return ['error' => 'User not found'];
        }

        $subscriptions = $this->db->query("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'", [$userId]);

        return ['user' => $user[0], 'subscriptions' => $subscriptions];
    }

    public function updateSettings(string $userId, array $data): array {
        $updates = [];
        $params = [];

        if (isset($data['language'])) {
            $updates[] = 'language = ?';
            $params[] = $data['language'];
        }

        if (isset($data['username'])) {
            $updates[] = 'username = ?';
            $params[] = $data['username'];
        }

        if (!empty($updates)) {
            $params[] = $userId;
            $this->db->execute("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?", $params);
        }

        return ['success' => true];
    }
}

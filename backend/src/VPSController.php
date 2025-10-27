<?php
namespace MiraiVPN;

class VPSController {
    private Database $db;

    public function __construct(Database $db) {
        $this->db = $db;
    }

    public function getStatus(): array {
        $servers = $this->db->query("SELECT id, name, region, active_users, max_users, status, ping_ms, cpu_load, bw_mbps FROM vps_servers WHERE status = 'up'");
        return ['success' => true, 'servers' => $servers];
    }

    public function choose(array $data): array {
        $userId = $data['user_id'];
        $region = $data['region'] ?? null;

        // Check if user has active subscription
        $sub = $this->db->query("SELECT id, status FROM subscriptions WHERE user_id = ? AND status = 'active'", [$userId]);
        if (empty($sub)) {
            return ['error' => 'No active subscription'];
        }

        $query = "SELECT id, name, region, active_users, max_users FROM vps_servers WHERE status = 'up' AND active_users < max_users";
        $params = [];

        if ($region) {
            $query .= " AND region = ?";
            $params[] = $region;
        }

        $query .= " ORDER BY active_users ASC LIMIT 1 FOR UPDATE";

        $this->db->getConnection()->beginTransaction();

        try {
            $vps = $this->db->query($query, $params);
            if (empty($vps)) {
                $this->db->getConnection()->rollBack();
                return ['error' => 'No available VPS'];
            }

            $vps = $vps[0];

            // Reserve the VPS for this user
            $this->db->execute("UPDATE subscriptions SET vps_id = ? WHERE id = ?", [$vps['id'], $sub[0]['id']]);
            $this->db->execute("UPDATE vps_servers SET active_users = active_users + 1 WHERE id = ?", [$vps['id']]);

            $this->db->getConnection()->commit();

            return ['success' => true, 'vps' => $vps];
        } catch (\Exception $e) {
            $this->db->getConnection()->rollBack();
            return ['error' => 'Failed to choose VPS'];
        }
    }

    public function confirm(array $data): array {
        $userId = $data['user_id'];

        // Get subscription with VPS
        $sub = $this->db->query("SELECT s.id, s.vps_id, v.name, v.region FROM subscriptions s JOIN vps_servers v ON s.vps_id = v.id WHERE s.user_id = ? AND s.status = 'active'", [$userId]);
        if (empty($sub)) {
            return ['error' => 'No active subscription with VPS'];
        }

        $sub = $sub[0];

        // Generate WireGuard config
        $config = ConfigGenerator::generateWireGuardConfig('', '', ConfigGenerator::generateWireGuardKeys()['private']);

        // Save config path
        $configPath = '/var/miraivpn/configs/' . $userId . '.conf';
        file_put_contents($configPath, $config);

        // Update database
        $this->db->execute("INSERT INTO wireguard_peers (id, user_id, vps_id, conf_path) VALUES (?, ?, ?, ?)", [
            $this->generateId(), $userId, $sub['vps_id'], $configPath
        ]);

        return ['success' => true, 'config' => $config];
    }

    public function getConfig(array $data): array {
        $userId = $data['user_id'];

        $peer = $this->db->query("SELECT conf_path FROM wireguard_peers WHERE user_id = ? AND active = 1", [$userId]);
        if (empty($peer)) {
            return ['error' => 'No active configuration'];
        }

        $configPath = $peer[0]['conf_path'];
        if (!file_exists($configPath)) {
            return ['error' => 'Configuration file not found'];
        }

        $config = file_get_contents($configPath);
        return ['success' => true, 'config' => $config];
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

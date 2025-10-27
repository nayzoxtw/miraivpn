<?php
namespace MiraiVPN;

class ConfigGenerator {
    public static function generateWireGuardConfig(string $serverPublicKey, string $serverEndpoint, string $clientPrivateKey, string $clientAddress = '10.0.0.2/24'): string {
        return "[Interface]
PrivateKey = $clientPrivateKey
Address = $clientAddress
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = $serverPublicKey
Endpoint = $serverEndpoint
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25";
    }

    public static function generateWireGuardKeys(): array {
        $privateKey = trim(shell_exec('wg genkey'));
        $publicKey = trim(shell_exec("echo '$privateKey' | wg pubkey"));

        return [
            'private' => $privateKey,
            'public' => $publicKey
        ];
    }
}

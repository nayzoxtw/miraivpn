<?php
namespace MiraiVPN;

use Resend;

class Mailer {
    private Resend $resend;

    public function __construct() {
        $this->resend = new Resend($_ENV['RESEND_API_KEY']);
    }

    public function sendVerificationEmail(string $email, string $token): bool {
        $verifyUrl = $_ENV['APP_URL'] . "/verify?token=$token";

        $result = $this->resend->emails->send([
            'from' => $_ENV['MAIL_FROM'],
            'to' => [$email],
            'subject' => 'Verify your MiraiVPN account',
            'html' => "<h2>Welcome to MiraiVPN</h2><p>Click here to verify your email: <a href='$verifyUrl'>$verifyUrl</a></p>"
        ]);

        return isset($result['id']);
    }

    public function sendPasswordResetEmail(string $email, string $token): bool {
        $resetUrl = $_ENV['APP_URL'] . "/reset?token=$token";

        $result = $this->resend->emails->send([
            'from' => $_ENV['MAIL_FROM'],
            'to' => [$email],
            'subject' => 'MiraiVPN Password Reset',
            'html' => "<h2>Password Reset</h2><p>Click here to reset your password: <a href='$resetUrl'>$resetUrl</a></p>"
        ]);

        return isset($result['id']);
    }
}

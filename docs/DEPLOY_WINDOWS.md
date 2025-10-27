# MiraiVPN Windows Deployment Guide

This guide explains how to deploy MiraiVPN from Windows to a Linux VPS using the `deploy.bat` script.

## Prerequisites

### Local Requirements (Windows)

1. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PHP 8.3+**
   - Download from: https://windows.php.net/download/
   - Add to PATH environment variable
   - Verify: `php --version`

3. **Composer**
   - Download from: https://getcomposer.org/
   - Add to PATH
   - Verify: `composer --version`

4. **PuTTY (pscp & plink)**
   - Download from: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
   - Install and add to PATH
   - Verify: `pscp` and `plink` commands work

5. **Git**
   - For cloning the repository
   - Verify: `git --version`

### Server Requirements (Linux VPS)

1. **Ubuntu/Debian server** with:
   - Nginx
   - PHP 8.3+ with FPM
   - MySQL/MariaDB
   - Node.js 18+ (for PM2)
   - PM2 process manager

2. **SSH access** with key-based authentication (recommended)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/miraivpn.git
cd miraivpn
```

### 2. Configure Environment

Copy and edit the deployment configuration:

```bash
copy .env.deploy.example .env.deploy
notepad .env.deploy
```

Fill in your actual values:

```env
# VPS SSH Configuration
VPS_HOST=your.vps.ip.address
VPS_USER=root
VPS_PORT=22

# Remote Paths
REMOTE_ROOT=/var/www/miraivpn
REMOTE_RELEASES=/var/www/miraivpn/releases
REMOTE_CURRENT=/var/www/miraivpn/current
REMOTE_BACKUPS=/var/www/miraivpn/backups

# Application Configuration
APP_URL=https://miraivpn.com
API_BASE=/backend

# API Security
X_API_KEY=your_super_secret_api_key_here

# MySQL Database
DB_HOST=sql.miraivpn.com
DB_PORT=3306
DB_NAME=miraivpn
DB_USER=miraivpn
DB_PASS=your_database_password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
RESEND_API_KEY=re_your_resend_api_key
MAIL_FROM="MiraiVPN <no-reply@miraivpn.com>"

# Discord Bot (optional)
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
STAFF_ROLE_ID=your_staff_role_id
LOG_CHANNEL_ID=your_log_channel_id
```

### 3. First-Time Server Provisioning

Before deploying, set up your VPS:

#### SSH Key Setup (Recommended)

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "deploy@miraivpn.com"

# Copy public key to server
ssh-copy-id root@your.vps.ip
```

#### Server Setup Script

Run this on your VPS to prepare it:

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx mysql-server php8.3-fpm php8.3-mysql php8.3-curl php8.3-zip php8.3-mbstring php8.3-xml php8.3-gd curl

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create directories
mkdir -p /var/www/miraivpn/releases
mkdir -p /var/www/miraivpn/backups
mkdir -p /var/log/pm2

# Set permissions
chown -R www-data:www-data /var/www/miraivpn
chmod -R 755 /var/www/miraivpn

# Configure PHP-FPM
# Edit /etc/php/8.3/fpm/pool.d/www.conf if needed for user/group

# Enable services
systemctl enable nginx
systemctl enable php8.3-fpm
systemctl enable mysql

# Start services
systemctl start nginx
systemctl start php8.3-fpm
systemctl start mysql

# Secure MySQL (run mysql_secure_installation)
```

## Deployment Commands

### Build Only

Build artifacts locally without deploying:

```bash
deploy.bat build
```

This creates:
- `dist/miraivpn-YYYYMMDD-HHMMSS.zip`
- Local log: `deploy-logs/deploy-YYYYMMDD-HHMMSS.log`

### Build and Upload

Build and upload to server without switching live:

```bash
deploy.bat push
```

### Full Release

Complete deployment with service restart:

```bash
deploy.bat release
```

This performs:
1. Build artifacts
2. Upload and extract on server
3. Create backup of current release
4. Switch symlink to new release
5. Run database migrations (idempotent)
6. Reload Nginx and PHP-FPM
7. Restart Discord bot with PM2

### Rollback

Revert to previous working release:

```bash
deploy.bat rollback
```

### Dry Run

Test deployment without making changes:

```bash
deploy.bat release --dry-run
```

Shows all commands that would be executed.

### Provision Server

Upload server configuration files (first deployment only):

```bash
deploy.bat release --provision
```

Uploads:
- `server/nginx_miraivpn.conf` → `/etc/nginx/sites-available/`
- `server/ecosystem.config.js` → `/var/www/miraivpn/`

## Post-Deployment Setup

### 1. SSL Certificate

Install SSL certificate (Let's Encrypt example):

```bash
# On server
apt install certbot python3-certbot-nginx
certbot --nginx -d miraivpn.com -d www.miraivpn.com
```

### 2. Database Setup

Create the database and user:

```sql
-- On MySQL server
CREATE DATABASE miraivpn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'miraivpn'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON miraivpn.* TO 'miraivpn'@'%';
FLUSH PRIVILEGES;
```

### 3. Stripe Webhook

Configure webhook endpoint in Stripe Dashboard:
- URL: `https://miraivpn.com/backend/api/stripe/webhook`
- Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`

### 4. DNS Configuration

Point your domain to the VPS IP address.

## Troubleshooting

### Common Issues

#### "pscp: command not found"
- PuTTY not in PATH
- Reinstall PuTTY and add installation directory to PATH

#### "Permission denied (publickey)"
- SSH key not set up correctly
- Check `~/.ssh/authorized_keys` on server
- Use password auth temporarily: `set PLINK_PROTOCOL=ssh` in environment

#### "Composer install failed"
- PHP not in PATH
- Run `php --version` to verify
- Check PHP extensions: `php -m | grep -E "(curl|zip|mbstring|xml)"`

#### "Nginx test failed"
- Check Nginx configuration syntax
- Verify file permissions on server
- Check PHP-FPM socket path in Nginx config

#### "Database connection failed"
- Verify MySQL credentials in `.env.deploy`
- Check if MySQL server is running: `systemctl status mysql`
- Test connection: `mysql -h host -u user -p`

#### "Bot won't start"
- Check PM2 logs: `pm2 logs miraivpn-bot`
- Verify Discord token in environment
- Check Node.js version: `node --version`

### Logs

All deployment operations are logged to:
- Local: `deploy-logs/deploy-YYYYMMDD-HHMMSS.log`
- Server: Check PM2 logs with `pm2 logs miraivpn-bot`

### Manual Recovery

If automatic deployment fails:

1. **Check server logs:**
   ```bash
   # Nginx
   tail -f /var/log/nginx/error.log

   # PHP-FPM
   tail -f /var/log/php8.3-fpm.log

   # PM2
   pm2 logs miraivpn-bot
   ```

2. **Manual rollback:**
   ```bash
   # SSH to server
   cd /var/www/miraivpn
   ls -la backups/  # Find latest backup
   tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz -C releases/
   ln -sfn releases/rollback-YYYYMMDD-HHMMSS current
   systemctl reload nginx
   systemctl reload php8.3-fpm
   cd current/bot && pm2 restart miraivpn-bot
   ```

3. **Clean up failed releases:**
   ```bash
   cd /var/www/miraivpn
   ls releases/  # Identify failed release
   rm -rf releases/failed-release-name
   ```

## Security Notes

- **Never commit `.env.deploy`** to version control
- Use strong, unique passwords for database and SSH
- Enable firewall (ufw) on VPS
- Keep server packages updated
- Use SSH key authentication only
- Regularly rotate API keys and tokens

## Monitoring

After deployment, monitor:

- **Application health:** `https://miraivpn.com/health`
- **Bot status:** `pm2 status` on server
- **Logs:** Check log files regularly
- **Database:** Monitor connection and performance
- **SSL:** Check certificate expiration

## Support

For issues:
1. Check deployment logs
2. Review server logs
3. Test individual components manually
4. Check network connectivity
5. Verify all prerequisites are met

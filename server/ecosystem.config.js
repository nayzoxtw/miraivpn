// PM2 ecosystem configuration for MiraiVPN Discord bot
// Place this file in /var/www/miraivpn/ecosystem.config.js
// Usage: pm2 startOrReload ecosystem.config.js --only miraivpn-bot

module.exports = {
  apps: [{
    name: 'miraivpn-bot',
    script: 'src/bot/index.js',
    cwd: '/var/www/miraivpn/current/bot',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      // Environment variables will be loaded from .env file in the bot directory
    },
    error_file: '/var/log/pm2/miraivpn-bot-error.log',
    out_file: '/var/log/pm2/miraivpn-bot-out.log',
    log_file: '/var/log/pm2/miraivpn-bot.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true,
    // Health check
    health_check: {
      enabled: true,
      max_restarts: 5,
      min_uptime: '10s'
    }
  }]
};

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(190) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified TINYINT(1) DEFAULT 0,
  language VARCHAR(8) DEFAULT 'fr',
  twofa_secret VARCHAR(64) NULL,
  credits_cents INT DEFAULT 0,
  sponsor_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vps_servers (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  region VARCHAR(8) NOT NULL,
  status ENUM('up','down','degraded') DEFAULT 'up',
  ping_ms INT DEFAULT 0,
  active_users INT DEFAULT 0,
  max_users INT DEFAULT 50,
  cpu_load DECIMAL(4,2) DEFAULT 0.00,
  bw_mbps INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  plan ENUM('basic','premium','vip') NOT NULL,
  region VARCHAR(8) NOT NULL,
  vps_id CHAR(36) NULL,
  stripe_sub_id VARCHAR(64) NULL,
  status ENUM('active','past_due','canceled','incomplete') DEFAULT 'incomplete',
  quota_gb INT DEFAULT 200,
  used_gb DECIMAL(10,2) DEFAULT 0.00,
  started_at DATETIME NULL,
  ends_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vps_id) REFERENCES vps_servers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS wireguard_peers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  vps_id CHAR(36) NOT NULL,
  conf_path VARCHAR(255) NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vps_id) REFERENCES vps_servers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id CHAR(36) PRIMARY KEY,
  sponsor_user_id CHAR(36) NOT NULL,
  referred_user_id CHAR(36) NOT NULL UNIQUE,
  subscription_id CHAR(36) NULL,
  status ENUM('pending','confirmed','revoked') DEFAULT 'pending',
  unlock_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sponsor_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  amount_cents INT NOT NULL,
  reason VARCHAR(64) NOT NULL,
  related_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(64) NOT NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

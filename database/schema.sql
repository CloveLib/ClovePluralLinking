-- ClovesPluralLink Database Schema
-- Multi-platform identity linking system for Discord, Minecraft, and Hytale

-- Main users table linking Discord accounts to game accounts
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_uid VARCHAR(20) NOT NULL UNIQUE,
    minecraft_uuid VARCHAR(36) UNIQUE,
    hytale_aid VARCHAR(36) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_discord (discord_uid),
    INDEX idx_minecraft (minecraft_uuid),
    INDEX idx_hytale (hytale_aid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Minecraft servers configuration
CREATE TABLE IF NOT EXISTS minecraft_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id VARCHAR(50) NOT NULL UNIQUE,
    server_name VARCHAR(100) NOT NULL,
    server_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_server_id (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hytale servers configuration
CREATE TABLE IF NOT EXISTS hytale_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id VARCHAR(50) NOT NULL UNIQUE,
    server_name VARCHAR(100) NOT NULL,
    server_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_server_id (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User preferences for Minecraft servers
CREATE TABLE IF NOT EXISTS user_minecraft_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    server_id INT NOT NULL,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES minecraft_servers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_server (user_id, server_id),
    INDEX idx_user (user_id),
    INDEX idx_server (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User preferences for Hytale servers
CREATE TABLE IF NOT EXISTS user_hytale_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    server_id INT NOT NULL,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES hytale_servers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_server (user_id, server_id),
    INDEX idx_user (user_id),
    INDEX idx_server (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PluralKit members sync table
CREATE TABLE IF NOT EXISTS pluralkit_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pk_system_id VARCHAR(10) NOT NULL,
    pk_member_id VARCHAR(10) NOT NULL,
    member_name VARCHAR(100),
    member_display_name VARCHAR(100),
    member_avatar_url TEXT,
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pk_member (user_id, pk_member_id),
    INDEX idx_user (user_id),
    INDEX idx_pk_system (pk_system_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- /plu/ral import data
CREATE TABLE IF NOT EXISTS plural_imports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    import_data JSON NOT NULL,
    import_type VARCHAR(50) DEFAULT 'plural',
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API tokens for server-to-server communication
CREATE TABLE IF NOT EXISTS api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    minecraft_server_id INT,
    hytale_server_id INT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (minecraft_server_id) REFERENCES minecraft_servers(id) ON DELETE SET NULL,
    FOREIGN KEY (hytale_server_id) REFERENCES hytale_servers(id) ON DELETE SET NULL,
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some example data
INSERT INTO minecraft_servers (server_id, server_name, server_address) VALUES
    ('server_id_1', 'ClovesPluralCraft Main', 'mc.clovesplural.com'),
    ('server_id_2', 'ClovesPluralCraft Creative', 'creative.clovesplural.com');

INSERT INTO hytale_servers (server_id, server_name, server_address) VALUES
    ('server_id_3', 'ClovesPluralTale Hub', 'hytale.clovesplural.com'),
    ('server_id_4', 'ClovesPluralTale Adventure', 'adventure.clovesplural.com');
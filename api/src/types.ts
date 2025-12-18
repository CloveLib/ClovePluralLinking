import { Request } from 'express';

export interface User {
    id: number;
    discord_uid: string;
    minecraft_uuid: string | null;
    hytale_aid: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface MinecraftServer {
    id: number;
    server_id: string;
    server_name: string;
    server_address: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface HytaleServer {
    id: number;
    server_id: string;
    server_name: string;
    server_address: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserMinecraftServer {
    id: number;
    user_id: number;
    server_id: number;
    status: 'enabled' | 'disabled';
    created_at: Date;
    updated_at: Date;
}

export interface UserHytaleServer {
    id: number;
    user_id: number;
    server_id: number;
    status: 'enabled' | 'disabled';
    created_at: Date;
    updated_at: Date;
}

export interface PluralKitMember {
    id: number;
    user_id: number;
    pk_system_id: string;
    pk_member_id: string;
    member_name: string | null;
    member_display_name: string | null;
    member_avatar_url: string | null;
    sync_enabled: boolean;
    last_synced_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface PluralImport {
    id: number;
    user_id: number;
    import_data: any;
    import_type: string;
    imported_at: Date;
}

export interface ApiToken {
    id: number;
    token: string;
    name: string;
    minecraft_server_id: number | null;
    hytale_server_id: number | null;
    permissions: string[];
    is_active: boolean;
    last_used_at: Date | null;
    expires_at: Date | null;
    created_at: Date;
}

export interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    old_value: any;
    new_value: any;
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
}

export interface JWTPayload {
    userId: number;
    discordUid: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export interface UserProfile {
    user: User;
    minecraftServers: Array<{
        server: MinecraftServer;
        status: 'enabled' | 'disabled';
    }>;
    hytaleServers: Array<{
        server: HytaleServer;
        status: 'enabled' | 'disabled';
    }>;
    pluralkitMembers: PluralKitMember[];
}
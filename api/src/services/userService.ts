import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db';
import { User, UserProfile, MinecraftServer, HytaleServer, PluralKitMember } from '../types';

export class UserService {
    async getUserByDiscordId(discordUid: string): Promise<User | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE discord_uid = ?',
            [discordUid]
        );
        return rows[0] as User || null;
    }

    async getUserById(userId: number): Promise<User | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return rows[0] as User || null;
    }

    async getUserByMinecraftUuid(minecraftUuid: string): Promise<User | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE minecraft_uuid = ?',
            [minecraftUuid]
        );
        return rows[0] as User || null;
    }

    async getUserByHytaleAid(hytaleAid: string): Promise<User | null> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE hytale_aid = ?',
            [hytaleAid]
        );
        return rows[0] as User || null;
    }

    async createUser(discordUid: string, minecraftUuid?: string, hytaleAid?: string): Promise<User> {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO users (discord_uid, minecraft_uuid, hytale_aid) VALUES (?, ?, ?)',
            [discordUid, minecraftUuid || null, hytaleAid || null]
        );

        const user = await this.getUserById(result.insertId);
        if (!user) throw new Error('Failed to create user');
        return user;
    }

    async updateUser(userId: number, updates: Partial<User>): Promise<User> {
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.minecraft_uuid !== undefined) {
            fields.push('minecraft_uuid = ?');
            values.push(updates.minecraft_uuid);
        }
        if (updates.hytale_aid !== undefined) {
            fields.push('hytale_aid = ?');
            values.push(updates.hytale_aid);
        }

        if (fields.length === 0) {
            const user = await this.getUserById(userId);
            if (!user) throw new Error('User not found');
            return user;
        }

        values.push(userId);
        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        const user = await this.getUserById(userId);
        if (!user) throw new Error('User not found');
        return user;
    }

    async getUserProfile(userId: number): Promise<UserProfile | null> {
        const user = await this.getUserById(userId);
        if (!user) return null;

        // Get Minecraft servers
        const [mcRows] = await db.query<RowDataPacket[]>(`
      SELECT ms.*, ums.status
      FROM user_minecraft_servers ums
      JOIN minecraft_servers ms ON ums.server_id = ms.id
      WHERE ums.user_id = ?
    `, [userId]);

        // Get Hytale servers
        const [htRows] = await db.query<RowDataPacket[]>(`
      SELECT hs.*, uhs.status
      FROM user_hytale_servers uhs
      JOIN hytale_servers hs ON uhs.server_id = hs.id
      WHERE uhs.user_id = ?
    `, [userId]);

        // Get PluralKit members
        const [pkRows] = await db.query<RowDataPacket[]>(
            'SELECT * FROM pluralkit_members WHERE user_id = ? AND sync_enabled = TRUE',
            [userId]
        );

        return {
            user,
            minecraftServers: mcRows.map(row => ({
                server: {
                    id: row.id,
                    server_id: row.server_id,
                    server_name: row.server_name,
                    server_address: row.server_address,
                    is_active: row.is_active,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                } as MinecraftServer,
                status: row.status
            })),
            hytaleServers: htRows.map(row => ({
                server: {
                    id: row.id,
                    server_id: row.server_id,
                    server_name: row.server_name,
                    server_address: row.server_address,
                    is_active: row.is_active,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                } as HytaleServer,
                status: row.status
            })),
            pluralkitMembers: pkRows as PluralKitMember[]
        };
    }

    async setMinecraftServerStatus(
        userId: number,
        serverId: number,
        status: 'enabled' | 'disabled'
    ): Promise<void> {
        await db.query(`
      INSERT INTO user_minecraft_servers (user_id, server_id, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?
    `, [userId, serverId, status, status]);
    }

    async setHytaleServerStatus(
        userId: number,
        serverId: number,
        status: 'enabled' | 'disabled'
    ): Promise<void> {
        await db.query(`
      INSERT INTO user_hytale_servers (user_id, server_id, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?
    `, [userId, serverId, status, status]);
    }

    async deleteUser(userId: number): Promise<void> {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
    }
}

export default new UserService();
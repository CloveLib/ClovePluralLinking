import axios from 'axios';
import db from '../db';
import { ResultSetHeader } from 'mysql2';

const PLURALKIT_API_URL = process.env.PLURALKIT_API_URL || 'https://api.pluralkit.me/v2';
const USER_AGENT = process.env.PLURALKIT_USER_AGENT || 'ClovesPluralLink/1.0';

interface PKSystem {
    id: string;
    uuid: string;
    name: string;
    description?: string;
    tag?: string;
    avatar_url?: string;
    banner?: string;
    color?: string;
    created: string;
}

interface PKMember {
    id: string;
    uuid: string;
    name: string;
    display_name?: string;
    color?: string;
    birthday?: string;
    pronouns?: string;
    avatar_url?: string;
    banner?: string;
    description?: string;
    created: string;
}

export class PluralKitService {
    async getSystemByAccount(discordId: string): Promise<PKSystem | null> {
        try {
            const response = await axios.get(
                `${PLURALKIT_API_URL}/systems/@${discordId}`,
                {
                    headers: {
                        'User-Agent': USER_AGENT
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async getSystemMembers(systemId: string): Promise<PKMember[]> {
        try {
            const response = await axios.get(
                `${PLURALKIT_API_URL}/systems/${systemId}/members`,
                {
                    headers: {
                        'User-Agent': USER_AGENT
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    }

    async syncUserMembers(userId: number, discordId: string): Promise<number> {
        const system = await this.getSystemByAccount(discordId);
        if (!system) {
            return 0;
        }

        const members = await this.getSystemMembers(system.id);
        let syncedCount = 0;

        for (const member of members) {
            await db.query(`
        INSERT INTO pluralkit_members (
          user_id, pk_system_id, pk_member_id, member_name, 
          member_display_name, member_avatar_url, sync_enabled, last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())
        ON DUPLICATE KEY UPDATE
          member_name = VALUES(member_name),
          member_display_name = VALUES(member_display_name),
          member_avatar_url = VALUES(member_avatar_url),
          last_synced_at = NOW()
      `, [
                userId,
                system.id,
                member.id,
                member.name,
                member.display_name || null,
                member.avatar_url || null
            ]);
            syncedCount++;
        }

        return syncedCount;
    }

    async importPluralData(userId: number, pluralData: any): Promise<void> {
        await db.query(`
      INSERT INTO plural_imports (user_id, import_data, import_type)
      VALUES (?, ?, 'plural')
    `, [userId, JSON.stringify(pluralData)]);

        // Process the plural data
        if (pluralData.members && Array.isArray(pluralData.members)) {
            for (const member of pluralData.members) {
                await db.query(`
          INSERT INTO pluralkit_members (
            user_id, pk_system_id, pk_member_id, member_name,
            member_display_name, member_avatar_url, sync_enabled
          ) VALUES (?, ?, ?, ?, ?, ?, TRUE)
          ON DUPLICATE KEY UPDATE
            member_name = VALUES(member_name),
            member_display_name = VALUES(member_display_name),
            member_avatar_url = VALUES(member_avatar_url)
        `, [
                    userId,
                    pluralData.id || 'imported',
                    member.id || `imported_${Date.now()}_${Math.random()}`,
                    member.name,
                    member.display_name || null,
                    member.avatar_url || null
                ]);
            }
        }
    }
}

export default new PluralKitService();
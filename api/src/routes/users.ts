import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import userService from '../services/userService';
import pluralkitService from '../services/pluralkitService';
import db from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const profile = await userService.getUserProfile(req.user!.userId);

        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(profile);
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user accounts
router.patch('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { minecraftUuid, hytaleAid } = req.body;
        const updates: any = {};

        if (minecraftUuid !== undefined) {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (minecraftUuid && !uuidRegex.test(minecraftUuid)) {
                return res.status(400).json({ error: 'Invalid Minecraft UUID format' });
            }
            updates.minecraft_uuid = minecraftUuid;
        }

        if (hytaleAid !== undefined) {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (hytaleAid && !uuidRegex.test(hytaleAid)) {
                return res.status(400).json({ error: 'Invalid Hytale AID format' });
            }
            updates.hytale_aid = hytaleAid;
        }

        const user = await userService.updateUser(req.user!.userId, updates);
        res.json(user);
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Get all Minecraft servers
router.get('/minecraft-servers', async (req: AuthRequest, res: Response) => {
    try {
        const [servers] = await db.query<RowDataPacket[]>(
            'SELECT * FROM minecraft_servers WHERE is_active = TRUE ORDER BY server_name'
        );
        res.json(servers);
    } catch (error) {
        console.error('Get MC servers error:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

// Get all Hytale servers
router.get('/hytale-servers', async (req: AuthRequest, res: Response) => {
    try {
        const [servers] = await db.query<RowDataPacket[]>(
            'SELECT * FROM hytale_servers WHERE is_active = TRUE ORDER BY server_name'
        );
        res.json(servers);
    } catch (error) {
        console.error('Get Hytale servers error:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
});

// Set Minecraft server status
router.put('/minecraft-servers/:serverId/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { serverId } = req.params;
        const { status } = req.body;

        if (!['enabled', 'disabled'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "enabled" or "disabled"' });
        }

        await userService.setMinecraftServerStatus(
            req.user!.userId,
            parseInt(serverId),
            status
        );

        res.json({ success: true, serverId, status });
    } catch (error) {
        console.error('Set MC server status error:', error);
        res.status(500).json({ error: 'Failed to update server status' });
    }
});

// Set Hytale server status
router.put('/hytale-servers/:serverId/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { serverId } = req.params;
        const { status } = req.body;

        if (!['enabled', 'disabled'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "enabled" or "disabled"' });
        }

        await userService.setHytaleServerStatus(
            req.user!.userId,
            parseInt(serverId),
            status
        );

        res.json({ success: true, serverId, status });
    } catch (error) {
        console.error('Set Hytale server status error:', error);
        res.status(500).json({ error: 'Failed to update server status' });
    }
});

// Sync PluralKit members
router.post('/pluralkit/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await userService.getUserById(req.user!.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const syncedCount = await pluralkitService.syncUserMembers(user.id, user.discord_uid);

        res.json({
            success: true,
            syncedCount,
            message: `Synced ${syncedCount} PluralKit members`
        });
    } catch (error: any) {
        console.error('PluralKit sync error:', error);
        res.status(500).json({
            error: 'Failed to sync PluralKit data',
            message: error.message
        });
    }
});

// Import /plu/ral data
router.post('/plural/import', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Import data required' });
        }

        await pluralkitService.importPluralData(req.user!.userId, data);

        res.json({
            success: true,
            message: 'Successfully imported /plu/ral data'
        });
    } catch (error: any) {
        console.error('Plural import error:', error);
        res.status(500).json({
            error: 'Failed to import data',
            message: error.message
        });
    }
});

// Lookup user by Minecraft UUID (public endpoint)
router.get('/lookup/minecraft/:uuid', async (req: AuthRequest, res: Response) => {
    try {
        const { uuid } = req.params;
        const user = await userService.getUserByMinecraftUuid(uuid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            discordUid: user.discord_uid,
            minecraftUuid: user.minecraft_uuid,
            hytaleAid: user.hytale_aid
        });
    } catch (error) {
        console.error('Lookup error:', error);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

// Lookup user by Hytale AID (public endpoint)
router.get('/lookup/hytale/:aid', async (req: AuthRequest, res: Response) => {
    try {
        const { aid } = req.params;
        const user = await userService.getUserByHytaleAid(aid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            discordUid: user.discord_uid,
            minecraftUuid: user.minecraft_uuid,
            hytaleAid: user.hytale_aid
        });
    } catch (error) {
        console.error('Lookup error:', error);
        res.status(500).json({ error: 'Lookup failed' });
    }
});

export default router;
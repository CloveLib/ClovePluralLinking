import { Router, Request, Response } from 'express';
import discordService from '../services/discordService';
import userService from '../services/userService';
import { generateToken } from '../middleware/auth';

const router = Router();

// Get Discord OAuth URL
router.get('/discord/url', (req: Request, res: Response) => {
    const authUrl = discordService.getAuthUrl();
    res.json({ url: authUrl });
});

// Discord OAuth callback
router.post('/discord/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code required' });
        }

        // Exchange code for access token
        const accessToken = await discordService.exchangeCode(code);

        // Get Discord user info
        const discordUser = await discordService.getUser(accessToken);

        // Find or create user in database
        let user = await userService.getUserByDiscordId(discordUser.id);

        if (!user) {
            user = await userService.createUser(discordUser.id);
        }

        // Generate JWT
        const token = generateToken(user.id, user.discord_uid);

        res.json({
            token,
            user: {
                id: user.id,
                discordUid: user.discord_uid,
                minecraftUuid: user.minecraft_uuid,
                hytaleAid: user.hytale_aid
            },
            discord: {
                id: discordUser.id,
                username: discordUser.username,
                discriminator: discordUser.discriminator,
                avatar: discordUser.avatar
            }
        });
    } catch (error: any) {
        console.error('Auth error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
});

// Verify token endpoint
router.get('/verify', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token required' });
        }

        // Token verification happens in middleware, but we'll do it manually here
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userService.getUserById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                discordUid: user.discord_uid,
                minecraftUuid: user.minecraft_uuid,
                hytaleAid: user.hytale_aid
            }
        });
    } catch (error) {
        res.status(403).json({
            valid: false,
            error: 'Invalid token'
        });
    }
});

export default router;
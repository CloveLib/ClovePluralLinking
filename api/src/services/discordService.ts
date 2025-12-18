import axios from 'axios';
import { DiscordUser } from '../types';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export class DiscordService {
    async exchangeCode(code: string): Promise<string> {
        const params = new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI!
        });

        const response = await axios.post(
            `${DISCORD_API_URL}/oauth2/token`,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    }

    async getUser(accessToken: string): Promise<DiscordUser> {
        const response = await axios.get(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data;
    }

    async refreshToken(refreshToken: string): Promise<string> {
        const params = new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        const response = await axios.post(
            `${DISCORD_API_URL}/oauth2/token`,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data.access_token;
    }

    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: CLIENT_ID!,
            redirect_uri: REDIRECT_URI!,
            response_type: 'code',
            scope: 'identify email'
        });

        return `${DISCORD_API_URL}/oauth2/authorize?${params.toString()}`;
    }
}

export default new DiscordService();
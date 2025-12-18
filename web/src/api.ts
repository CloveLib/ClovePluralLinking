import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    discordUid: string;
    minecraftUuid: string | null;
    hytaleAid: string | null;
}

export interface MinecraftServer {
    id: number;
    server_id: string;
    server_name: string;
    server_address: string | null;
    is_active: boolean;
}

export interface HytaleServer {
    id: number;
    server_id: string;
    server_name: string;
    server_address: string | null;
    is_active: boolean;
}

export interface PluralKitMember {
    id: number;
    user_id: number;
    pk_system_id: string;
    pk_member_id: string;
    member_name: string | null;
    member_display_name: string | null;
    memeber_avatar_url: string | null;
    sync_enabled: boolean;
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
    pluralkitMemebers: PluralKitMember[];
}

// Auth
export const authAPI = {
    getDiscordUrl: () => api.get<{ url: string }>('auth/discord/url'),
    callback: (code: string) => api.post('/auth/discord/callback', { code }),
    verify: () => api.get('auth/verify'),
};

// Users
export const userAPI = {
    getProfile: () => api.get<UserProfile>('/users/me'),
    updateProfile: (data: { minecraftUuid?: string; hytaleAid?: string }) =>
        api.patch<User>('/users/me', data),
    getMinecraftServers: () => api.get<MinecraftServer[]>('/users/minecraft-servers'),
    getHytaleServers: () => api.get<HytaleServer[]>('/users/hytale-servers'),
    setMinecraftServerStatus: (serverId: number, status: 'enabled' | 'disabled') =>
        api.put(`/users/minecraft-servers/${serverId}/status`, { status }),
    setHytaleServerStatus: (serverId: number, status: 'enabled' | 'disabled') =>
        api.put(`/users/hytale-servers/${serverId}/status`, { status }),
    syncPluralKit: () => api.post('/users/pluralkit/sync'),
    importPluralData: (data: any) => api.post('/users/plural/import', { data }),
};
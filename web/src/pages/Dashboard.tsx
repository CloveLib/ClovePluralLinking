import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Link2,
  Server,
  Users as UsersIcon,
  Save,
  RefreshCw,
  Upload,
  Sparkles,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { userAPI, UserProfile, MinecraftServer, HytaleServer } from '../api';

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mcServers, setMcServers] = useState<MinecraftServer[]>([]);
  const [htServers, setHtServers] = useState<HytaleServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [mcUuid, setMcUuid] = useState('');
  const [htAid, setHtAid] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, mcRes, htRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getMinecraftServers(),
        userAPI.getHytaleServers(),
      ]);

      setProfile(profileRes.data);
      setMcServers(mcRes.data);
      setHtServers(htRes.data);
      setMcUuid(profileRes.data.user.minecraftUuid || '');
      setHtAid(profileRes.data.user.hytaleAid || '');
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveAccounts = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({
        minecraftUuid: mcUuid || undefined,
        hytaleAid: htAid || undefined,
      });
      showMessage('success', 'Accounts updated successfully!');
      await loadData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Failed to update accounts');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMinecraftServer = async (serverId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      await userAPI.setMinecraftServerStatus(serverId, newStatus);
      await loadData();
      showMessage('success', `Server ${newStatus === 'enabled' ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      showMessage('error', 'Failed to update server status');
    }
  };

  const handleToggleHytaleServer = async (serverId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      await userAPI.setHytaleServerStatus(serverId, newStatus);
      await loadData();
      showMessage('success', `Server ${newStatus === 'enabled' ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      showMessage('error', 'Failed to update server status');
    }
  };

  const handleSyncPluralKit = async () => {
    setSyncing(true);
    try {
      const response = await userAPI.syncPluralKit();
      showMessage('success', response.data.message);
      await loadData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to sync PluralKit');
    } finally {
      setSyncing(false);
    }
  };

  const handleImportPlural = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await userAPI.importPluralData(data);
        showMessage('success', 'Successfully imported /plu/ral data!');
        await loadData();
      } catch (error) {
        showMessage('error', 'Failed to import data. Make sure the file is valid JSON.');
      }
    };
    input.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 font-display">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-purple-400" />
              <div className="absolute inset-0 bg-purple-500/30 blur-xl animate-glow"></div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient">
                ClovesPluralLink
              </h1>
              <p className="text-purple-200/70 text-sm">Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </motion.header>

      {/* Message Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`glass-panel p-4 mb-6 flex items-center gap-3 ${
            message.type === 'success' ? 'border-clover-500/50' : 'border-red-500/50'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-clover-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={message.type === 'success' ? 'text-clover-300' : 'text-red-300'}>
            {message.text}
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Account Links */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Link2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-display font-bold">Linked Accounts</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Discord ID
                </label>
                <input
                  type="text"
                  value={profile?.user.discordUid || ''}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Minecraft UUID
                </label>
                <input
                  type="text"
                  value={mcUuid}
                  onChange={(e) => setMcUuid(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="input-field font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Hytale AID
                </label>
                <input
                  type="text"
                  value={htAid}
                  onChange={(e) => setHtAid(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="input-field font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSaveAccounts}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Accounts
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* PluralKit Section */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <UsersIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-display font-bold">PluralKit</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={handleSyncPluralKit}
                  disabled={syncing}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  {syncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync Members
                    </>
                  )}
                </button>
                <button
                  onClick={handleImportPlural}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import /plu/ral
                </button>
              </div>

              {profile && profile.pluralkitMembers.length > 0 && (
                <div className="glass-panel p-4 space-y-2">
                  <p className="text-sm font-medium text-purple-200 mb-3">
                    Synced Members ({profile.pluralkitMembers.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {profile.pluralkitMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 glass-panel"
                      >
                        {member.member_avatar_url && (
                          <img
                            src={member.member_avatar_url}
                            alt={member.member_name || ''}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.member_display_name || member.member_name}
                          </p>
                          <p className="text-xs text-purple-300/70 font-mono">
                            {member.pk_member_id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* Right Column - Servers */}
        <div className="space-y-8">
          {/* Minecraft Servers */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-6 h-6 text-clover-400" />
              <h2 className="text-2xl font-display font-bold">Minecraft Servers</h2>
            </div>

            <div className="space-y-3">
              {mcServers.map((server) => {
                const userServer = profile?.minecraftServers.find(
                  (s) => s.server.id === server.id
                );
                const status = userServer?.status || 'disabled';

                return (
                  <div key={server.id} className="game-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold mb-1">
                          {server.server_name}
                        </h3>
                        {server.server_address && (
                          <p className="text-sm text-purple-300/70 font-mono">
                            {server.server_address}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleMinecraftServer(server.id, status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          status === 'enabled'
                            ? 'bg-clover-500/20 text-clover-300 hover:bg-clover-500/30'
                            : 'bg-white/5 text-purple-300 hover:bg-white/10'
                        }`}
                      >
                        {status === 'enabled' ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Hytale Servers */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-display font-bold">Hytale Servers</h2>
            </div>

            <div className="space-y-3">
              {htServers.map((server) => {
                const userServer = profile?.hytaleServers.find(
                  (s) => s.server.id === server.id
                );
                const status = userServer?.status || 'disabled';

                return (
                  <div key={server.id} className="game-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold mb-1">
                          {server.server_name}
                        </h3>
                        {server.server_address && (
                          <p className="text-sm text-purple-300/70 font-mono">
                            {server.server_address}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleHytaleServer(server.id, status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          status === 'enabled'
                            ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30'
                            : 'bg-white/5 text-purple-300 hover:bg-white/10'
                        }`}
                      >
                        {status === 'enabled' ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
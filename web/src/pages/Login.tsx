import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Gamepad2, Users, Sparkles } from 'lucide-react';
import { authAPI } from '../api';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getDiscordUrl();
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to get Discord URL:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Link2,
      title: 'Unified Identity',
      description: 'Link your Discord, Minecraft, and Hytale accounts seamlessly'
    },
    {
      icon: Gamepad2,
      title: 'Multi-Server Sync',
      description: 'Toggle server access across all ClovesPluralCraft and Tale servers'
    },
    {
      icon: Users,
      title: 'PluralKit Integration',
      description: 'Sync your system members and import /plu/ral data effortlessly'
    }
  ];

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-clover-500/10 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/30 blur-xl animate-glow"></div>
              </div>
              <h1 className="text-5xl font-display font-bold text-gradient">
                ClovesPluralLink
              </h1>
            </motion.div>

            <p className="text-xl text-purple-200/80 mb-8 font-body">
              Your unified identity across ClovesPluralCraft & Tale
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-4 glass-panel p-4"
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                    <feature.icon className="w-6 h-6 text-purple-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-purple-200/70">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Login card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-purple-200/70">
                Sign in with Discord to continue
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl font-display font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Sign in with Discord
                </>
              )}
            </motion.button>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-purple-200/60 text-center">
                By signing in, you agree to sync your Discord, Minecraft, and Hytale accounts with ClovesPluralLink
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
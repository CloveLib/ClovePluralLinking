import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { authAPI } from '../api';

interface AuthCallbackProps {
  onSuccess: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authenticating with Discord...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Authentication cancelled or failed');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      const response = await authAPI.callback(code);
      localStorage.setItem('token', response.data.token);
      setStatus('success');
      setMessage('Successfully authenticated!');
      setTimeout(() => {
        onSuccess();
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Authentication failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 text-center max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-display font-bold mb-2">Connecting...</h2>
            <p className="text-purple-200/70">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-clover-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold mb-2">Success!</h2>
            <p className="text-purple-200/70">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold mb-2">Oops!</h2>
            <p className="text-purple-200/70">{message}</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
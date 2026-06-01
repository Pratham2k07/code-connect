import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Code2, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/setup');
    }
  }, [user, navigate]);

  const handleGitHubLogin = async () => {
    try {
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!envUrl || envUrl === '' || envUrl.includes('placeholder') || envUrl.includes('your_project_url_here')) {
        console.warn("Supabase not configured. Proceeding in mockup mode.");
        navigate('/setup');
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/setup`
        }
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!envUrl || envUrl === '' || envUrl.includes('placeholder') || envUrl.includes('your_project_url_here')) {
        console.warn("Supabase not configured. Proceeding in mockup mode.");
        navigate('/setup');
        return;
      }
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If user doesn't exist or invalid credentials, try to sign up
        if (error.message === 'Invalid login credentials') {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/setup`
            }
          });
          if (signUpError) throw signUpError;
          alert('Account created! Please check your email for verification. The link should now redirect properly.');
        } else {
          throw error;
        }
      } else if (data.user) {
        navigate('/setup');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 relative z-10 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard gradient="linear-gradient(137deg, #FF3D77 0%, #FF9D3C 100%)" className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-textMain">Welcome to CodeConnect</h1>
          <p className="text-textMuted mb-8">Sign in to find your perfect coding partner.</p>

          <div className="space-y-6 w-full">
            <Button 
              variant="outline" 
              className="w-full h-12 relative flex justify-center items-center hover:bg-[#24292e] hover:text-white transition-colors border-cardBorder bg-card"
              onClick={handleGitHubLogin}
            >
              <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-cardBorder"></div>
              <span className="flex-shrink-0 mx-4 text-textMuted text-sm">Or continue with Email</span>
              <div className="flex-grow border-t border-cardBorder"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full bg-background border border-cardBorder rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 text-textMain placeholder:text-textMuted transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  required
                  className="w-full bg-background border border-cardBorder rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 text-textMain placeholder:text-textMuted transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full h-12" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In / Sign Up'}
              </Button>
            </form>
          </div>

          <p className="text-xs text-textMuted mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

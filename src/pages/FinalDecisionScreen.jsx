import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Users, Code2, Heart, X, Sparkles } from 'lucide-react';

export function FinalDecisionScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 px-4 pb-4 flex items-center justify-center relative z-10 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-cardBorder mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Phase Complete</h1>
          <p className="text-textMuted text-lg">Your initial collaboration period has ended. How would you like to proceed?</p>
        </div>

        <GlassCard gradient="linear-gradient(137deg, #A855F7 0%, #EC4899 100%)" className="p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 bg-card border border-cardBorder rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-textMain">Project Partners</h3>
              <p className="text-xs text-textMuted text-center">Continue building together professionally.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 bg-card border border-cardBorder rounded-xl hover:border-secondary/50 hover:bg-secondary/5 transition-all group"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-textMain">Explore Connection</h3>
              <p className="text-xs text-textMuted text-center">Take things to the next level.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 bg-card border border-cardBorder rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-all group"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-textMain">Friends & Network</h3>
              <p className="text-xs text-textMuted text-center">Stay in touch as developer friends.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center p-6 bg-card border border-cardBorder rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <X className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-textMain">End Respectfully</h3>
              <p className="text-xs text-textMuted text-center">Disconnect and find new matches.</p>
            </motion.button>

          </div>
          
          <div className="p-4 border-t border-cardBorder text-center">
            <p className="text-xs text-textMuted">Both users must select a compatible option to continue.</p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

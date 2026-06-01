import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShinyText } from '../ui/ShinyText';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/#features' },
  { label: 'Matches', to: '/dashboard' },
  { label: 'Collab Rooms', to: '/rooms' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between h-14 px-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)]">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-full border-2 border-white">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <ShinyText
              text="CodeConnect"
              baseColor="#22d3ee"
              shineColor="#ffffff"
              speed={4}
              spread={120}
              className="font-bold text-xl tracking-tight"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full border border-gray-700/60 bg-white/5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-white/70 hover:text-white px-3 py-1 rounded-full transition-colors hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 group px-5 py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                Logout
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-2 group px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mx-4 mt-2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-white/70 hover:text-white px-4 py-3 rounded-xl transition-colors hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center justify-center gap-2 mt-2 px-5 py-3 rounded-full bg-white/10 text-white border border-white/20 text-sm font-semibold"
                >
                  Logout <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  className="flex items-center justify-center gap-2 mt-2 px-5 py-3 rounded-full bg-primary text-background text-sm font-semibold"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

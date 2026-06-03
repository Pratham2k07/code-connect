import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { mockPartner as defaultMockPartner, mockMatchingPool } from '../data/mockData';
import { Zap, Code2, Sparkles, ChevronRight, HeartHandshake } from 'lucide-react';
import { generateAiIdeas } from '../utils/ideaGenerator';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/* ─────────────────────────────────────────
   CONFETTI
───────────────────────────────────────── */
function ConfettiBurst({ count = 100 }) {
  const pieces = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 900,
    y: -(Math.random() * 700 + 100),
    rotate: Math.random() * 1080,
    color: ['#22d3ee','#f472b6','#4ade80','#fde047','#a78bfa','#fb923c','#ff6b6b'][i % 7],
    size: Math.random() * 14 + 5,
    shape: ['circle','rect','star'][Math.floor(Math.random() * 3)],
    delay: Math.random() * 0.4,
  })), [count]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <motion.div key={p.id} className="absolute"
          style={{ width: p.size, height: p.shape === 'rect' ? p.size * 0.4 : p.size,
            backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '3px',
            top: '50%', left: '50%' }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 2.5, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   PROFESSIONAL SCANNER STAGE
───────────────────────────────────────── */
const SCAN_STEPS = [
  { label: 'Scanning tech stack compatibility...', icon: '⚙️' },
  { label: 'Analyzing collaboration style...',     icon: '🤝' },
  { label: 'Matching availability windows...',     icon: '📅' },
  { label: 'Calculating connection score...',      icon: '📊' },
  { label: 'Finalizing your top match...',         icon: '✅' },
];

function ScannerStage({ progress, scanPool }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    const cardTimer = setInterval(() => setCardIndex(i => i + 1), 1800);
    return () => clearInterval(cardTimer);
  }, []);

  useEffect(() => {
    const step = Math.min(Math.floor(progress / 22), SCAN_STEPS.length - 1);
    setStepIndex(step);
  }, [Math.floor(progress / 22)]);

  const profile = scanPool[cardIndex % scanPool.length] || scanPool[0];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-4xl px-4 lg:px-0">

      {/* LEFT — Progress ring */}
      <div className="flex flex-col items-center gap-6 shrink-0">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)' }} />

          {/* SVG ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="6" />
            <motion.circle cx="60" cy="60" r="54" fill="none"
              stroke="url(#scanGrad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>

          {/* Rotating ping dot */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          </motion.div>

          {/* Center */}
          <div className="flex flex-col items-center z-10">
            <span className="text-4xl font-black text-primary tabular-nums">{Math.floor(progress)}%</span>
            <span className="text-xs text-textMuted font-medium mt-0.5">Match Score</span>
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-2 w-full max-w-xs">
          {SCAN_STEPS.map((step, i) => (
            <motion.div key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= stepIndex ? 1 : 0.25, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2.5"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                i < stepIndex  ? 'border-primary bg-primary/20 text-primary' :
                i === stepIndex ? 'border-primary bg-primary/10 text-primary animate-pulse' :
                'border-cardBorder text-textMuted'
              } text-xs font-bold`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${
                i <= stepIndex ? 'text-textMain' : 'text-textMuted'
              }`}>{step.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT — Sliding profile cards */}
      <div className="flex flex-col items-center gap-5">
        <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Evaluating Profile</p>

        {/* Card */}
        <div className="relative w-full max-w-md overflow-hidden" style={{ height: 220 }}>
          <AnimatePresence mode="wait">
            <motion.div key={cardIndex}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -80, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden"
              style={{ borderColor: `${profile.color}40` }}
            >
              {/* Top accent line */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${profile.color}, transparent)` }} />

              {/* Scan line sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.04) 50%, transparent 100%)' }}
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}&backgroundColor=b6e3f4`}
                    className="w-12 h-12 rounded-full border-2"
                    style={{ borderColor: `${profile.color || '#22d3ee'}60` }}
                    alt={profile.name}
                  />
                  <div>
                    <p className="font-bold text-textMain text-sm">@{profile.name?.toLowerCase() || 'dev'}</p>
                    <p className="text-xs font-medium" style={{ color: profile.color || '#22d3ee' }}>{profile.role || 'Developer'}</p>
                  </div>
                  {/* Analyzing badge */}
                  <div className="ml-auto flex items-center gap-1 text-xs text-textMuted font-medium">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    Analyzing
                  </div>
                </div>

                {/* Stack */}
                <div className="flex gap-1.5 flex-wrap">
                  {(profile.tech_stack || profile.stack || []).slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-lg border border-cardBorder text-textMuted font-medium">{s}</span>
                  ))}
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-textMuted">Compatibility</span>
                    <span style={{ color: profile.color }}>Calculating...</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cardBorder overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: profile.color }}
                      initial={{ width: '20%' }}
                      animate={{ width: ['20%', '80%', '45%', '65%'] }}
                      transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
                    />
                  </div>
                </div>

                <div className="text-xs text-textMuted flex items-center gap-1.5 pt-1">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-textMuted"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  Not your top match — scanning next...
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card counter dots */}
        <div className="flex gap-1.5">
          {scanPool.slice(0, 10).map((_, i) => (
            <motion.div key={i}
              className="w-1.5 h-1.5 rounded-full"
              animate={{ backgroundColor: i === cardIndex % Math.min(scanPool.length, 10) ? '#22d3ee' : 'rgba(255,255,255,0.15)' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <p className="text-xs text-textMuted text-center max-w-[200px] leading-relaxed">
          Evaluated <span className="text-textMain font-semibold">{cardIndex + 1}</span> of 12,000+ profiles
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LOCK-ON STAGE
───────────────────────────────────────── */
function LockOnStage({ partner }) {
  const [phase, setPhase] = useState(0); // 0=flying in, 1=connected, 2=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div key="lockon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center">

      {/* Two avatars connecting */}
      <div className="relative flex items-center justify-center w-80 h-48 mb-6">
        {/* Your avatar */}
        <motion.div className="absolute flex flex-col items-center"
          initial={{ x: -140, opacity: 0 }} animate={{ x: phase >= 1 ? -70 : -140, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-primary shadow-[0_0_25px_rgba(34,211,238,0.5)] overflow-hidden bg-card">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=c0aede" className="w-full h-full" alt="You" />
          </div>
          <span className="text-xs text-primary font-bold mt-2">You</span>
        </motion.div>

        {/* Connection sparks */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div className="absolute flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {phase === 1 && [0, 1, 2, 3, 4, 5].map(i => (
                <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{
                    x: Math.cos(i / 6 * Math.PI * 2) * 25,
                    y: Math.sin(i / 6 * Math.PI * 2) * 25,
                    opacity: [1, 0],
                  }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
              {phase === 2 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                  className="text-4xl">💥</motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partner avatar */}
        <motion.div className="absolute flex flex-col items-center"
          initial={{ x: 140, opacity: 0 }} animate={{ x: phase >= 1 ? 70 : 140, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-secondary shadow-[0_0_25px_rgba(244,114,182,0.5)] overflow-hidden bg-card">
            <img src={partner?.avatar} className="w-full h-full" alt={partner?.name} />
          </div>
          <span className="text-xs text-secondary font-bold mt-2">{partner?.name}</span>
        </motion.div>
      </div>

      <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <p className="text-2xl font-black text-textMain">
          {phase === 0 ? '🔍 Locking on...' : phase === 1 ? '⚡ Syncing vibes...' : '🎯 Connected!'}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   COUNTER
───────────────────────────────────────── */
function Counter({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{val}</>;
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export function MatchDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stage, setStage] = useState('searching'); // searching | lockon | found | dashboard
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [dynamicIdeas, setDynamicIdeas] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  // Matchmaking State
  const [finalPartner, setFinalPartner] = useState(defaultMockPartner);
  const [scanPool, setScanPool] = useState(mockMatchingPool);
  
  // Searching state
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  const SEARCH_PHASES = [
    'Scanning developers...',
    'Checking compatibility...',
    'Analyzing collaboration style...',
    'Calculating match score...',
    'Finalizing your match...',
  ];
  const [searchPhaseIdx, setSearchPhaseIdx] = useState(0);

  // 1. MATCHMAKING ALGORITHM
  useEffect(() => {
    async function calculatePerfectMatch() {
      try {
        let userProfile = null;
        let pool = mockMatchingPool; // start with mock pool

        if (user && isSupabaseConfigured) {
          // Fetch current user
          const { data: currentUserData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (currentUserData) userProfile = currentUserData;

          // Fetch other users
          const { data: otherUsers } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .limit(50);
          
          if (otherUsers && otherUsers.length > 0) {
            pool = [...otherUsers, ...mockMatchingPool]; // combine pools
          }
        } else {
          // Fallback to local storage profile if Supabase is offline
          const localProfileStr = localStorage.getItem('localUserProfile');
          if (localProfileStr) {
            try {
              userProfile = JSON.parse(localProfileStr);
            } catch (e) {
              console.error(e);
            }
          }
        }

        // Shuffle pool to avoid picking the same person on ties
        pool = [...pool].sort(() => Math.random() - 0.5);
        setScanPool(pool);

        // Score pool
        let bestScore = -1;
        let bestMatch = pool[0];
        let bestSharedData = { sharedTech: [], sharedInterests: [] };

        pool.forEach(candidate => {
          let score = 0;
          const sharedTech = [];
          const sharedInterests = [];

          if (userProfile) {
            // Start with a base vibe score to ensure good matches
            score = 45 + Math.random() * 15;

            // Tech stack overlap (40 pts max)
            const userTech = userProfile.tech_stack || [];
            const candTech = candidate.tech_stack || [];
            userTech.forEach(t => {
              if (candTech.includes(t)) {
                score += 15;
                sharedTech.push(t);
              }
            });

            // Interests overlap (30 pts max)
            const userInt = userProfile.interests || [];
            const candInt = candidate.interests || [];
            userInt.forEach(i => {
              if (candInt.includes(i)) {
                score += 10;
                sharedInterests.push(i);
              }
            });

            // Goals overlap (20 pts max)
            const userGoals = userProfile.goals || [];
            const candGoals = candidate.goals || [];
            userGoals.forEach(g => {
              if (candGoals.includes(g)) { score += 10; }
            });

            // Preference (10 pts)
            if (userProfile.preference === candidate.gender || userProfile.preference === 'Anyone') score += 5;
            if (candidate.preference === userProfile.gender || candidate.preference === 'Anyone') score += 5;

            // Cap at 99
            score = Math.min(score, 99);
          } else {
            // Mock baseline if not logged in
            score = 65 + Math.random() * 30;
          }

          // Ensure minimum visual score
          score = Math.max(score, 55);

          if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
            bestSharedData = {
              sharedTech: sharedTech.length ? sharedTech : (candidate.tech_stack || []).slice(0, 3),
              sharedInterests: sharedInterests.length ? sharedInterests : (candidate.interests || []).slice(0, 3)
            };
          }
        });

        // Set final winner
        setFinalPartner({
          id: bestMatch.id,
          name: bestMatch.name || bestMatch.seed || 'Developer',
          avatar: bestMatch.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bestMatch.name}&backgroundColor=b6e3f4`,
          vibeScore: Math.floor(bestScore),
          sharedTech: bestSharedData.sharedTech.length ? bestSharedData.sharedTech : ['React', 'Node.js'],
          sharedInterests: bestSharedData.sharedInterests.length ? bestSharedData.sharedInterests : ['Startups', 'Web Dev'],
        });

      } catch (err) {
        console.error("Matchmaking error:", err);
      }
    }
    
    calculatePerfectMatch();
  }, [user]);

  // Auto-progress
  useEffect(() => {
    if (stage !== 'searching') return;
    progressRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + 0.8;
        if (next >= 100) {
          clearInterval(progressRef.current);
          setStage('lockon');
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(progressRef.current);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'searching') return;
    const t = setInterval(() => setSearchPhaseIdx(i => Math.min(i + 1, SEARCH_PHASES.length - 1)), 1600);
    return () => clearInterval(t);
  }, [stage]);

  // lockon → found
  useEffect(() => {
    if (stage !== 'lockon') return;
    const t = setTimeout(() => {
      setStage('found');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 3200);
    return () => clearTimeout(t);
  }, [stage]);

  // found → dashboard
  useEffect(() => {
    if (stage !== 'found') return;
    const t = setTimeout(() => setStage('dashboard'), 5000);
    return () => clearTimeout(t);
  }, [stage]);

  // dashboard ideas
  useEffect(() => {
    if (stage !== 'dashboard') return;
    const t = setTimeout(() => {
      setDynamicIdeas(generateAiIdeas(finalPartner.sharedTech, 3));
      setIsGenerating(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [stage, finalPartner]);

  return (
    <div className="min-h-screen pt-20 px-4 pb-20 max-w-6xl mx-auto w-full z-10 relative flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">

        {/* ══ STAGE 1: PROFESSIONAL SCANNER ══ */}
        {stage === 'searching' && (
          <motion.div key="searching"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center w-full gap-10"
          >
            <div>
              <div className="badge-pill mb-4 mx-auto w-fit border-primary/30 bg-primary/10 text-primary">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                <span className="font-bold tracking-wide uppercase text-xs">Live Matching</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-textMain mb-3">
                Finding your <span className="shimmer-text">perfect match</span>
              </h1>
              <AnimatePresence mode="wait">
                <motion.p key={searchPhaseIdx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-textMuted text-base font-medium"
                >
                  {SEARCH_PHASES[searchPhaseIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <ScannerStage progress={progress} scanPool={scanPool} />
          </motion.div>
        )}

        {/* ══ STAGE 2: LOCK-ON ══ */}
        {stage === 'lockon' && (
          <motion.div key="lockon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
            <LockOnStage partner={finalPartner} />
          </motion.div>
        )}

        {/* ══ STAGE 3: MATCH FOUND ══ */}
        {stage === 'found' && (
          <motion.div key="found"
            initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="flex flex-col items-center text-center relative py-8"
          >
            {showConfetti && <ConfettiBurst count={120} />}

            {/* Burst rings */}
            <div className="relative mb-8">
              {[1, 2, 3, 4].map(i => (
                <motion.div key={i} className="absolute rounded-full border-2 border-primary"
                  style={{ inset: 0, margin: 'auto', width: 120, height: 120 }}
                  initial={{ width: 120, height: 120, opacity: 0.9 }}
                  animate={{ width: 120 + i * 140, height: 120 + i * 140, opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.12, ease: 'easeOut' }}
                />
              ))}

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.1 }}
                className="w-36 h-36 rounded-full border-4 border-primary shadow-[0_0_80px_rgba(34,211,238,0.8)] overflow-hidden relative z-10 bg-card"
              >
                <img src={finalPartner.avatar} alt={finalPartner.name} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            {/* MATCH label bouncing */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [1, 1.1, 1], rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.3 }}
              className="text-6xl font-black mb-3 shimmer-text"
            >
              IT'S A MATCH! 🎉
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-textMuted mb-8">
              You & <span className="text-primary">{finalPartner.name}</span> are a legendary duo
            </motion.h2>

            {/* Vibe score — big and fun */}
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className="relative p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-[0_0_50px_rgba(34,211,238,0.15)] mb-8">
              <div className="text-8xl font-black text-primary tabular-nums mb-1">
                <Counter target={finalPartner.vibeScore} duration={1500} />%
              </div>
              <div className="text-sm font-bold text-textMuted uppercase tracking-widest">🔥 Vibe Score</div>
              <div className="mt-4 w-48 h-3 bg-cardBorder rounded-full overflow-hidden mx-auto">
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #22d3ee, #f472b6, #4ade80)' }}
                  initial={{ width: '0%' }} animate={{ width: `${finalPartner.vibeScore}%` }}
                  transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* Shared tech flying in */}
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {finalPartner.sharedTech.map((tech, i) => (
                <motion.span key={tech}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.12, type: 'spring', stiffness: 300 }}
                  className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-sm font-bold bg-primary/10">
                  {tech}
                </motion.span>
              ))}
            </div>

            <motion.p className="text-sm text-textMuted mt-8 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              ✨ Opening your collaboration room...
            </motion.p>
          </motion.div>
        )}

        {/* ══ STAGE 4: DASHBOARD ══ */}
        {stage === 'dashboard' && (
          <motion.div key="dashboard"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full">

            <div className="mb-8 text-center">
              <div className="badge-pill mb-4 mx-auto w-fit">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>You're Matched!</span>
              </div>
              <h1 className="text-4xl font-black text-textMain mb-1">
                You & <span className="shimmer-text">{finalPartner.name}</span>
              </h1>
              <p className="text-textMuted">Now pick what you want to build together.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Partner Card */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                <GlassCard gradient="linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)" className="h-full">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <img src={finalPartner.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-primary/40 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-card" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background font-black text-xs shadow-lg">
                        {finalPartner.vibeScore}%
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-textMain">{finalPartner.name}</h2>
                    <div className="flex items-center text-primary mt-1">
                      <Zap className="w-4 h-4 mr-1" /><span className="text-sm font-semibold">Vibe Match</span>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-textMuted mb-2 flex items-center uppercase tracking-wider">
                        <Code2 className="w-3.5 h-3.5 mr-2 text-primary" /> Shared Stack
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {finalPartner.sharedTech.map((t, i) => (
                          <motion.span key={t} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.08, type: 'spring' }}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-xs text-primary font-medium">{t}</motion.span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-textMuted mb-2 flex items-center uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-secondary" /> Shared Interests
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {finalPartner.sharedInterests.map((interest, i) => (
                          <motion.span key={interest} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
                            className="px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/25 text-xs text-secondary font-medium">{interest}</motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Ideas Panel */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="col-span-1 md:col-span-2">
                <GlassCard gradient="linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)" className="h-full flex flex-col">
                  <div className="mb-5 flex justify-between items-center shrink-0">
                    <div>
                      <h2 className="text-2xl font-bold text-textMain">What should you build?</h2>
                      <p className="text-textMuted text-sm mt-1">AI-generated ideas based on your combined stack.</p>
                    </div>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="text-secondary w-6 h-6" />
                    </motion.div>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: '420px' }}>
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                          <div className="text-5xl animate-bounce">🤖</div>
                          <div>
                            <h3 className="text-lg font-bold text-textMain">AI is brainstorming...</h3>
                            <p className="text-sm text-textMuted mt-1">Mixing <span className="text-primary">{finalPartner.sharedTech.join(' + ')}</span></p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="ideas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                          {dynamicIdeas.map((idea, i) => (
                            <motion.div key={idea.id}
                              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.12, duration: 0.4 }}
                              whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }}
                              onClick={() => setSelectedIdea(idea.id)}
                              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                                selectedIdea === idea.id
                                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                                  : 'bg-card/50 border-cardBorder hover:border-primary/30 hover:bg-card'
                              }`}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-textMain">{idea.title}</h3>
                                <span className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1 rounded-md shrink-0 ml-2">{idea.matchScore}% Match</span>
                              </div>
                              <p className="text-sm text-textMuted mb-3 leading-relaxed">{idea.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {idea.tags.map(tag => (
                                  <span key={tag} className="text-xs text-primary/80 font-medium">#{tag}</span>
                                ))}
                              </div>
                            </motion.div>
                          ))}

                          {/* Free Play Mode */}
                          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedIdea('custom')}
                            className={`relative p-1 rounded-2xl cursor-pointer transition-all overflow-hidden ${
                              selectedIdea === 'custom' ? 'shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'hover:shadow-[0_0_20px_rgba(244,114,182,0.2)]'
                            }`}>
                            <div className={`absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent ${selectedIdea === 'custom' ? 'opacity-60 animate-pulse' : 'opacity-20'}`} />
                            <div className="relative rounded-xl p-5 flex items-center gap-5 bg-[#0b0f19]">
                              <div className="absolute inset-0 rounded-xl opacity-10 bg-[radial-gradient(circle_at_30%_50%,rgba(244,114,182,1),transparent)]" />
                              <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/30 flex items-center justify-center text-3xl shrink-0">
                                🎮
                              </motion.div>
                              <div className="relative z-10">
                                <h3 className="font-black text-lg text-gradient-primary uppercase tracking-wide">Free Play Mode</h3>
                                <p className="text-sm text-textMuted mt-1">Skip AI suggestions. Chat with <span className="text-primary font-semibold">{finalPartner.name}</span> and build your own thing!</p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-5 pt-4 border-t border-cardBorder shrink-0">
                    <motion.button
                      onClick={() => navigate(`/room/${finalPartner.id || '1'}`, { state: { mode: selectedIdea === 'custom' ? 'discussion' : 'coding', ideaId: selectedIdea, partner: finalPartner } })}
                      disabled={!selectedIdea}
                      whileHover={selectedIdea ? { scale: 1.02 } : {}}
                      whileTap={selectedIdea ? { scale: 0.98 } : {}}
                      className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                        selectedIdea
                          ? 'bg-primary text-background shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]'
                          : 'bg-card border border-cardBorder text-textMuted cursor-not-allowed'
                      }`}
                    >
                      Enter Collaboration Room <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

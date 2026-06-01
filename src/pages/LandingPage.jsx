import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Sparkles, Star, HeartHandshake, Monitor, Palette } from 'lucide-react';
import { ShinyText } from '../components/ui/ShinyText';
import { GlowFeatureCard } from '../components/ui/GlowFeatureCard';

/* ─── Typing Effect ─── */
const TYPING_TEXTS = [
  'your startup co-founder.',
  'your late-night coding buddy.',
  'your next best friend.',
  'your open-source collaborator.',
];

function useTypingEffect(texts, speed = 75, pause = 2200) {
  const [displayText, setDisplayText] = useState('');
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayText(current.slice(0, char + 1));
        if (char + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setChar(c => c + 1);
      } else {
        setDisplayText(current.slice(0, char - 1));
        if (char - 1 === 0) { setDeleting(false); setIdx(i => (i + 1) % texts.length); setChar(0); }
        else setChar(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [char, deleting, idx, texts, speed, pause]);

  return displayText;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/[^0-9]/g, ''));
    let start = 0;
    const step = num / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Tech Marquee ─── */
const TECH_TAGS = ['React', 'Python', 'Go', 'Rust', 'TypeScript', 'Flutter', 'Next.js', 'Node.js', 'TensorFlow', 'Solidity', 'Swift', 'Kotlin', 'Docker', 'AWS', 'Vue', 'Angular'];

function TechMarquee() {
  const doubled = [...TECH_TAGS, ...TECH_TAGS];
  return (
    <div className="relative overflow-hidden py-4">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-black to-transparent" />
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 text-white/40 bg-white/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Stats ─── */
const stats = [
  { number: '12000', suffix: '+', label: 'Developers Matched' },
  { number: '3400', suffix: '', label: 'Projects Launched' },
  { number: '98', suffix: '%', label: 'Vibe Match Rate' },
  { number: '40', suffix: '+', label: 'Tech Stacks' },
];

/* ─── Features ─── */
const features = [
  {
    icon: <Zap size={32} strokeWidth={2.5} />,
    title: 'Smart Matching',
    desc: 'Our algorithm analyzes your tech stack, goals, and coding style to find your perfect development partner.',
    gradient: 'linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)',
    delay: 0.1,
  },
  {
    icon: <Monitor size={32} strokeWidth={2.5} />,
    title: 'Collab Rooms',
    desc: 'Jump into dedicated workspaces with real-time chat, AI assistance, and integrated project planning.',
    gradient: 'linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)',
    delay: 0.2,
  },
  {
    icon: <Sparkles size={32} strokeWidth={2.5} />,
    title: 'Build Together',
    desc: 'Stop coding alone. Join forces to build real startups, open-source projects, and hackathon winners.',
    gradient: 'linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)',
    delay: 0.3,
  },
];

const avatarSeeds = ['Alex', 'Jamie', 'Sam', 'Riley', 'Jordan', 'Casey'];

export function LandingPage() {
  const navigate = useNavigate();
  const typingText = useTypingEffect(TYPING_TEXTS);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO — full-screen video background
      ══════════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col overflow-hidden bg-black">

        {/* Video BG */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(34,211,238,0.06),transparent)]" />

        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(34,211,238,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content — z-10 above global video */}

        {/* Content — z-10 above video */}
        <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24">

          {/* Top two-col info strip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col lg:flex-row justify-between gap-4 mb-auto pt-4"
          >
            <p className="text-white/70 text-sm text-base max-w-sm leading-relaxed">
              We connect talented developers worldwide to build real projects, real startups, and real friendships.
            </p>
            <p className="text-white/70 text-sm text-base lg:text-right font-semibold">
              12,000+ Talented Developers Matched !
            </p>
          </motion.div>

          {/* Main hero content — vertically centered */}
          <div className="flex flex-col items-center justify-center flex-1 text-center pb-16">

            {/* Small label */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.2em] mb-6 font-medium"
            >
              New Matches Opening Soon
            </motion.p>

            {/* Giant headline */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                className="font-semibold tracking-tighter text-4xl sm:text-6xl md:text-7xl lg:text-8xl mx-auto"
                style={{ lineHeight: 1.1 }}
              >
                <span className="block text-white mb-2">Built for developers,</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 pb-2">
                  designed for connection.
                </span>
              </h1>
            </motion.div>

            {/* Typing subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-lg sm:text-xl text-white/60"
            >
              Find{' '}
              <span className="text-primary font-semibold cursor-blink">
                {typingText}
              </span>
            </motion.p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, type: 'spring', stiffness: 150 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="group mt-10 inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full bg-black border border-white/20 text-white font-semibold text-base hover:bg-gray-900 hover:border-white/40 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]"
            >
              Apply for Next Enrollment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-4 mt-10"
            >
              <div className="flex -space-x-3">
                {avatarSeeds.map((seed, i) => (
                  <motion.img
                    key={seed}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede`}
                    className="w-9 h-9 rounded-full border-2 border-black"
                    alt={seed}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + i * 0.08, type: 'spring', stiffness: 200 }}
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-secondary fill-secondary" />)}
                </div>
                <p className="text-sm text-white/50">Loved by <strong className="text-white/80">12,000+</strong> devs</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-white/60"
              animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          TECH MARQUEE
      ══════════════════════════════════════════════ */}
      <div className="border-y border-white/5 bg-black">
        <TechMarquee />
      </div>

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-white mb-1 tabular-nums">
                <AnimatedCounter target={s.number} suffix={s.suffix} />
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-6xl mx-auto"
        >
          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">How it works</p>
          <h2
            className="text-4xl md:text-6xl font-medium tracking-tighter text-white"
            style={{ lineHeight: 0.9 }}
          >
            Built for developers,<br />
            <ShinyText
              text="designed for connection."
              baseColor="#22d3ee"
              shineColor="#f472b6"
              speed={4}
              spread={120}
            />
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-3 lg:gap-3 w-full max-w-[936px] mx-auto">
          {features.map((f, i) => (
            <GlowFeatureCard
              key={f.title}
              title={f.title}
              description={f.desc}
              icon={f.icon}
              gradient={f.gradient}
              delay={f.delay}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA — video bleed-through
      ══════════════════════════════════════════════ */}
      <section className="relative py-32 px-4 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-6">Ready to begin?</p>
          <h2
            className="text-5xl md:text-7xl font-medium tracking-tighter text-white mb-10"
            style={{ lineHeight: 0.88 }}
          >
            Find your<br />
            <ShinyText
              text="perfect match."
              baseColor="#22d3ee"
              shineColor="#ffffff"
              speed={3}
              spread={100}
            />
          </h2>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-all shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.35)]"
          >
            Apply for Next Enrollment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

    </div>
  );
}

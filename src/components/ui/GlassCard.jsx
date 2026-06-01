import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export function GlassCard({ className, children, hoverEffect = false, glow = true, gradient = "linear-gradient(137deg, #22d3ee 0%, #a78bfa 100%)", ...props }) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5 } : {}}
      className={cn("relative flex flex-col w-full group", className)}
      {...props}
    >
      {/* 
        Static Glowing Effect Sibling
        Exactly mimicking GlowFeatureCard architecture 
      */}
      {glow && (
        <div 
          className="absolute inset-0 w-full h-full opacity-25 rounded-[32px] pointer-events-none" 
          style={{
            background: gradient,
            filter: 'blur(15px)',
          }}
        />
      )}
      
      {/* 
        Foreground Card with Gradient Border
        Exactly mimicking GlowFeatureCard architecture 
      */}
      <div
        className="relative self-stretch w-full h-full rounded-[32px] z-10 flex flex-col p-6 sm:p-8 overflow-hidden"
        style={{
          border: '4px solid transparent',
          background: `linear-gradient(#1A1A1C, #1A1A1C) padding-box, ${gradient} border-box`,
        }}
      >
        <div className="relative z-20 flex flex-col flex-1 h-full">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

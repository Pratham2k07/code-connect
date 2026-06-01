import React from 'react';
import { motion } from 'framer-motion';

/**
 * ShinyText — continuously sweeping gradient highlight over text.
 * Props:
 *   text        – string to render
 *   baseColor   – base text color  (default '#22d3ee')
 *   shineColor  – shine color      (default '#ffffff')
 *   speed       – animation duration in seconds (default 3)
 *   spread      – gradient cone in degrees (default 100)
 *   className   – extra classes
 */
export function ShinyText({
  text,
  baseColor = '#22d3ee',
  shineColor = '#ffffff',
  speed = 3,
  spread = 100,
  className = '',
}) {
  return (
    <motion.span
      aria-label={text}
      className={`inline-block relative ${className}`}
      style={{
        // fallback colour while gradient is calculated
        color: baseColor,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      animate={{
        backgroundImage: [
          `linear-gradient(${spread}deg, ${baseColor} 0%, ${baseColor} 20%, ${shineColor} 50%, ${baseColor} 80%, ${baseColor} 100%)`,
          `linear-gradient(${spread}deg, ${baseColor} 0%, ${shineColor} 50%, ${baseColor} 80%, ${baseColor} 100%)`,
          `linear-gradient(${spread}deg, ${baseColor} 0%, ${baseColor} 20%, ${baseColor} 60%, ${shineColor} 90%, ${baseColor} 100%)`,
          `linear-gradient(${spread}deg, ${baseColor} 0%, ${baseColor} 20%, ${baseColor} 40%, ${shineColor} 70%, ${baseColor} 100%)`,
        ],
        backgroundSize: ['200% 100%', '200% 100%', '200% 100%', '200% 100%'],
        backgroundPosition: ['-100%', '0%', '100%', '200%'],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  );
}

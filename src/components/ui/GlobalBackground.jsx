import React from 'react';
import { SparklesCore } from './sparkles';

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none flex flex-col items-center">
      
      {/* 
        The top glowing gradients from the Aceternity demo.
        Positioned right under the Navbar.
      */}
      <div className="absolute top-0 w-full max-w-4xl opacity-80">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 mx-auto blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4 mx-auto" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 mx-auto blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4 mx-auto" />
      </div>

      {/* Sparkles Particle Engine */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={100} // Tuned for full screen (less dense than a small div)
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        
        {/* Radial Gradient to fade edges into pure black */}
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_100%)]" />
      </div>
      
    </div>
  );
}

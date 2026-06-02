import React from 'react';
import { getLanguageFromExtension } from './utils';
import { useSandpack } from "@codesandbox/sandpack-react";
import { Cpu, Wifi, Code2 } from 'lucide-react';

export const IDEStatusBar = ({ isSimulating }) => {
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const language = getLanguageFromExtension(activeFile);

  return (
    <div className="flex items-center justify-between px-4 py-1 shrink-0 select-none relative overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, rgba(34,211,238,0.15) 0%, rgba(15,20,35,0.95) 40%, rgba(244,114,182,0.1) 100%)',
        borderTop: '1px solid rgba(34,211,238,0.2)',
      }}
    >
      {/* Subtle shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(244,114,182,0.4), transparent)' }} />

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'rgba(34,211,238,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}>
            {isSimulating ? 'Piston Runtime' : 'WebContainer'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3 h-3" style={{ color: 'rgba(244,114,182,0.7)' }} />
          <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.8)' }}>Antigravity IDE</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-[11px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded"
          style={{ 
            color: '#22d3ee', 
            background: 'rgba(34,211,238,0.1)', 
            border: '1px solid rgba(34,211,238,0.2)',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        >
          {language || 'Plain Text'}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.6)' }}>UTF-8</span>
        <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.6)' }}>Spaces: 2</span>
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3" style={{ color: 'rgba(74,222,128,0.7)' }} />
          <span className="text-[11px]" style={{ color: 'rgba(74,222,128,0.7)' }}>Live</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X } from 'lucide-react';
import { getFileIcon } from './utils';
import { useSandpack } from "@codesandbox/sandpack-react";

export const IDETabs = ({ openFiles, closeFile, activeFilePath, setActiveFilePath }) => {
  const { sandpack } = useSandpack();
  
  // Use prop if provided, fallback to sandpack
  const currentFile = activeFilePath || sandpack.activeFile;

  return (
    <div 
      className="flex overflow-x-auto shrink-0 select-none custom-scrollbar"
      style={{ 
        background: 'rgba(11,15,25,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {openFiles.map(file => {
        const Icon = getFileIcon(file);
        const isActive = file === currentFile;
        const displayName = file.startsWith('/') ? file.slice(1) : file;

        return (
          <div
            key={file}
            onClick={() => {
              if (setActiveFilePath) setActiveFilePath(file);
              else sandpack.setActiveFile(file);
            }}
            className="group flex items-center px-4 py-2.5 min-w-[130px] max-w-[210px] cursor-pointer transition-all duration-200 relative shrink-0"
            style={{
              background: isActive
                ? 'linear-gradient(180deg, rgba(34,211,238,0.06) 0%, rgba(11,15,25,0.98) 100%)'
                : 'transparent',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              borderTop: isActive
                ? '2px solid #22d3ee'
                : '2px solid transparent',
            }}
          >
            {/* Active glow at bottom */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-px" 
                style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)' }} 
              />
            )}

            <Icon className="w-3.5 h-3.5 mr-2 shrink-0" 
              style={{ color: isActive ? '#22d3ee' : 'rgba(148,163,184,0.5)', opacity: 0.9 }} 
            />
            <span
              className="text-[13px] truncate flex-1 font-medium"
              style={{ 
                color: isActive ? '#f8fafc' : 'rgba(148,163,184,0.6)',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {displayName}
            </span>
            <button
              onClick={e => { e.stopPropagation(); closeFile(file); }}
              className="ml-2 p-0.5 rounded transition-all duration-150 hover:scale-110"
              style={{ 
                opacity: isActive ? 1 : 0,
                color: 'rgba(148,163,184,0.6)',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#f472b6'; e.currentTarget.style.opacity = 1; }}
              onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.opacity = isActive ? 1 : 0; }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

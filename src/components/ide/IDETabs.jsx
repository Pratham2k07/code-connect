import React from 'react';
import { X } from 'lucide-react';
import { getFileIcon } from './utils';
import { useSandpack } from "@codesandbox/sandpack-react";

export const IDETabs = ({ openFiles, closeFile }) => {
  const { sandpack } = useSandpack();
  const { activeFile, setActiveFile } = sandpack;
  return (
    <div className="flex bg-[#111827] overflow-x-auto border-b border-gray-800 shrink-0 custom-scrollbar select-none">
      {openFiles.map(file => {
        const Icon = getFileIcon(file);
        const isActive = file === activeFile;
        const displayName = file.startsWith('/') ? file.slice(1) : file;
        
        return (
          <div 
            key={file}
            onClick={() => setActiveFile(file)}
            className={`group flex items-center px-4 py-2 min-w-[120px] max-w-[200px] border-r border-gray-800 cursor-pointer transition-colors ${
              isActive 
                ? 'bg-[#0d1117] text-white border-t-2 border-t-blue-500' 
                : 'bg-[#181818] text-gray-500 hover:bg-[#202020] border-t-2 border-t-transparent'
            }`}
          >
            <Icon className="w-4 h-4 mr-2 opacity-80 shrink-0" />
            <span className="text-sm truncate flex-1">{displayName}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file);
              }}
              className={`ml-2 p-0.5 rounded-md hover:bg-gray-700 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

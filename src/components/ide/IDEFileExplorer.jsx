import React, { useState } from 'react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { FilePlus, FolderPlus, File } from 'lucide-react';
import { getFileIcon } from './utils';

export const IDEFileExplorer = ({ openFile, addNewIDEFile }) => {
  const { sandpack } = useSandpack();
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [hoveredFile, setHoveredFile] = useState(null);

  const handleAddFile = (e) => {
    if (e.key === 'Enter') {
      if (newFileName.trim()) {
        const path = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
        if (addNewIDEFile) {
          addNewIDEFile(path);
        } else {
          if (sandpack.addFile) {
            sandpack.addFile(path, "");
          } else {
            sandpack.updateFile(path, "");
          }
        }
        sandpack.setActiveFile(path);
        openFile(path);
      }
      setIsAddingFile(false);
      setNewFileName('');
    } else if (e.key === 'Escape') {
      setIsAddingFile(false);
      setNewFileName('');
    }
  };

  const filePaths = Object.keys(sandpack.files)
    .filter(path => !sandpack.files[path].hidden)
    .sort();

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: 'rgba(11,15,25,0.95)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 group"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Explorer
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsAddingFile(true)}
            className="p-1 rounded transition-all duration-150"
            title="New File"
            style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseOver={e => { e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded transition-all duration-150"
            title="New Folder"
            style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseOver={e => { e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* New File Input */}
      {isAddingFile && (
        <div className="mx-2 mt-1 mb-1 flex items-center px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)' }}
        >
          <File className="w-3.5 h-3.5 mr-2 shrink-0" style={{ color: 'rgba(34,211,238,0.6)' }} />
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            onKeyDown={handleAddFile}
            onBlur={() => { setTimeout(() => { setIsAddingFile(false); setNewFileName(''); }, 150); }}
            className="bg-transparent w-full text-[13px] outline-none"
            style={{ color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}
            placeholder="filename.ext"
          />
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 pt-1">
        {filePaths.length === 0 && (
          <div className="px-4 py-6 text-center">
            <div className="text-[12px] mb-1" style={{ color: 'rgba(148,163,184,0.3)' }}>No files yet</div>
            <button
              onClick={() => setIsAddingFile(true)}
              className="text-[12px] transition-colors"
              style={{ color: 'rgba(34,211,238,0.5)' }}
              onMouseOver={e => e.currentTarget.style.color = '#22d3ee'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(34,211,238,0.5)'}
            >
              + Create a file
            </button>
          </div>
        )}
        {filePaths.map(path => {
          const isSelected = path === sandpack.activeFile;
          const fileName = path.split('/').pop();
          const Icon = getFileIcon(path);
          const depth = path.split('/').length - 1;
          const paddingLeft = `${depth * 12 + 12}px`;
          const isHovered = hoveredFile === path;

          return (
            <div
              key={path}
              onClick={() => { sandpack.setActiveFile(path); openFile(path); }}
              onMouseEnter={() => setHoveredFile(path)}
              onMouseLeave={() => setHoveredFile(null)}
              style={{ paddingLeft }}
              className="flex items-center py-1.5 pr-3 cursor-pointer transition-all duration-150 relative"
            >
              {/* Selected/hover background */}
              <div className="absolute inset-0 rounded transition-opacity duration-150"
                style={{
                  background: isSelected
                    ? 'linear-gradient(90deg, rgba(34,211,238,0.1) 0%, rgba(34,211,238,0.04) 100%)'
                    : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                  opacity: isSelected || isHovered ? 1 : 0,
                }}
              />
              {/* Active left indicator */}
              {isSelected && (
                <div className="absolute left-0 top-0.5 bottom-0.5 w-0.5 rounded-full"
                  style={{ background: '#22d3ee', boxShadow: '0 0 6px rgba(34,211,238,0.6)' }}
                />
              )}

              <Icon
                className="w-3.5 h-3.5 mr-2 shrink-0 relative z-10"
                style={{ color: isSelected ? '#22d3ee' : 'rgba(148,163,184,0.5)' }}
              />
              <span
                className="text-[13px] truncate flex-1 relative z-10 font-medium"
                style={{
                  color: isSelected ? '#f8fafc' : 'rgba(148,163,184,0.7)',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}
              >
                {fileName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { ChevronRight, ChevronDown, FilePlus, FolderPlus, MoreVertical, File } from 'lucide-react';
import { getFileIcon } from './utils';

export const IDEFileExplorer = ({ openFile, addNewIDEFile }) => {
  const { sandpack } = useSandpack();
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleAddFile = (e) => {
    if (e.key === 'Enter') {
      if (newFileName.trim()) {
        const path = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
        if (addNewIDEFile) {
           addNewIDEFile(path);
        } else {
           // Fallback if not provided
           sandpack.updateFile(path, { code: "" }); 
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
    <div className="flex flex-col h-full overflow-hidden bg-[#111827] text-gray-300">
      <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between shrink-0 group">
        <span>Explorer</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsAddingFile(true)} className="p-0.5 hover:bg-white/10 rounded transition-colors" title="New File">
            <FilePlus className="w-4 h-4" />
          </button>
          <button className="p-0.5 hover:bg-white/10 rounded transition-colors" title="New Folder">
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {isAddingFile && (
        <div className="flex items-center px-4 py-1 bg-white/5 border border-blue-500/50 mx-2 mb-1 rounded-sm">
          <File className="w-3.5 h-3.5 mr-2 text-gray-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            onKeyDown={handleAddFile}
            onBlur={() => {
              setTimeout(() => {
                setIsAddingFile(false);
                setNewFileName('');
              }, 150);
            }}
            className="bg-transparent w-full text-white text-[13px] outline-none"
            placeholder="filename.ext"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {filePaths.map(path => {
          const isSelected = path === sandpack.activeFile;
          const fileName = path.split('/').pop();
          const Icon = getFileIcon(path);
          const depth = path.split('/').length - 1;
          const paddingLeft = `${depth * 12 + 16}px`;

          return (
            <div 
              key={path}
              onClick={() => {
                sandpack.setActiveFile(path);
                openFile(path);
              }}
              style={{ paddingLeft }}
              className={`flex items-center py-1 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-500/20 text-white' : 'hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 mr-2 shrink-0 opacity-80" />
              <span className="text-[13px] truncate">{fileName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

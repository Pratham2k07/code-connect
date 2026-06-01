import React from 'react';
import { getLanguageFromExtension } from './utils';
import { useSandpack } from "@codesandbox/sandpack-react";

export const IDEStatusBar = ({ isSimulating }) => {
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const language = getLanguageFromExtension(activeFile);

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[11px] shrink-0 select-none">
      <div className="flex items-center space-x-4">
        <span>{isSimulating ? 'Simulated Native Execution' : 'Sandpack WebContainer'}</span>
        <span>Antigravity IDE</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <span className="uppercase">{language}</span>
      </div>
    </div>
  );
};

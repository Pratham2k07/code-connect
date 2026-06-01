import React from 'react';
import Editor from '@monaco-editor/react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { getLanguageFromExtension } from './utils';

export const IDEMonacoEditor = () => {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
  
  const code = files[activeFile]?.code || '';
  const language = getLanguageFromExtension(activeFile);

  const handleEditorChange = (value) => {
    sandpack.updateFile(activeFile, value || '');
  };

  return (
    <div className="flex-1 min-h-0 w-full bg-[#0d1117] relative">
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={code}
        path={activeFile}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
        loading={
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
};

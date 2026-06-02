import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { getLanguageFromExtension } from './utils';

export const IDEMonacoEditor = ({ editorRef, activeFilePath }) => {
  const { sandpack } = useSandpack();
  const { files } = sandpack;
  
  // Create a local ref if one wasn't passed in (for backward compatibility)
  const localEditorRef = useRef(null);
  const resolvedEditorRef = editorRef || localEditorRef;

  const currentFile = activeFilePath || sandpack.activeFile;

  // Read the CURRENT code from Sandpack only for the initial value when mounting.
  // We use `defaultValue` + `key={currentFile}` so Monaco creates a fresh model
  // per file. When the user switches files, the old model is saved via onChange
  // (sandpack.updateFile), and when they come back the model is reloaded
  // with the saved code. This eliminates the "code vanishes on switch" bug.
  const initialCode = files[currentFile]?.code ?? '';
  const language = getLanguageFromExtension(currentFile);

  const handleMount = (editor) => {
    resolvedEditorRef.current = editor;
    editor.updateOptions({ theme: 'antigravity-dark' });
  };

  const handleEditorChange = (value) => {
    // Keep Sandpack's internal state in sync so execution always has the latest code
    sandpack.updateFile(currentFile, value ?? '');
  };

  return (
    <div className="flex-1 min-h-0 w-full relative" style={{ background: '#0b0f19' }}>
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)' }}
      />
      {/* key={currentFile} ensures Monaco creates a fresh model per file.
          defaultValue loads the saved code from Sandpack when switching back. */}
      <Editor
        key={currentFile}
        height="100%"
        language={language}
        defaultValue={initialCode}
        path={currentFile}
        onChange={handleEditorChange}
        onMount={handleMount}
        beforeMount={monaco => {
          monaco.editor.defineTheme('antigravity-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
              { token: 'keyword', foreground: '22d3ee' },
              { token: 'string', foreground: '4ade80' },
              { token: 'number', foreground: 'f472b6' },
              { token: 'function', foreground: 'a78bfa' },
            ],
            colors: {
              'editor.background': '#0b0f19',
              'editor.foreground': '#e2e8f0',
              'editor.lineHighlightBackground': '#131927',
              'editor.selectionBackground': '#22d3ee22',
              'editor.inactiveSelectionBackground': '#22d3ee11',
              'editorLineNumber.foreground': '#2d3748',
              'editorLineNumber.activeForeground': '#22d3ee88',
              'editorCursor.foreground': '#22d3ee',
              'editorIndentGuide.background': '#1a2035',
              'editorIndentGuide.activeBackground': '#22d3ee33',
              'scrollbarSlider.background': '#22d3ee22',
              'scrollbarSlider.hoverBackground': '#22d3ee44',
              'scrollbarSlider.activeBackground': '#22d3ee66',
              'minimap.background': '#0d1220',
              'editorWidget.background': '#111827',
              'editorSuggestWidget.background': '#111827',
              'editorSuggestWidget.border': '#22d3ee33',
              'editorSuggestWidget.selectedBackground': '#22d3ee1a',
            }
          });
        }}
        options={{
          minimap: { enabled: true, scale: 1 },
          fontSize: 14,
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 20, bottom: 20 },
          lineNumbersMinChars: 3,
          glyphMargin: false,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
        loading={
          <div className="flex flex-col items-center justify-center h-full"
            style={{ background: '#0b0f19' }}
          >
            <div className="w-8 h-8 rounded-full border-2 animate-spin mb-3"
              style={{ borderColor: 'rgba(34,211,238,0.3)', borderTopColor: '#22d3ee' }}
            />
            <span className="text-sm" style={{ color: 'rgba(34,211,238,0.6)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Loading Editor...
            </span>
          </div>
        }
      />
    </div>
  );
};

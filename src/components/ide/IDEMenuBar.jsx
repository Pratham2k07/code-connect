import React, { useState } from 'react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { getExecutionCommand } from './utils';
import { Play, Terminal as TerminalIcon, Loader2, ChevronDown } from 'lucide-react';
import { PROJECT_TEMPLATES } from './projectTemplates';
import { executeCode, isPistonSupported } from '../../lib/piston';

export const IDEMenuBar = ({ setShowExplorer, showExplorer, setShowTerminal, showTerminal, setMockTerminalLogs, setSandpackFiles, setSandpackTemplate, terminalStdin, setActiveTerminalTab, editorRef, activeFilePath }) => {
  const { sandpack } = useSandpack();
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setShowTerminal(true);
    if (setActiveTerminalTab) setActiveTerminalTab('output');

    const fileToRun = activeFilePath || sandpack.activeFile;

    if (!fileToRun) {
      setMockTerminalLogs([
        { type: 'error', text: '✗ No file is open. Create a file and open it first.' }
      ]);
      return;
    }

    const ext = fileToRun.split('.').pop().toLowerCase();
    
    // Read the *live* code directly from Monaco to avoid Sandpack sync bugs when switching tabs
    let code = '';
    if (editorRef && editorRef.current) {
      code = editorRef.current.getValue();
    } else {
      code = sandpack.files[fileToRun]?.code ?? '';
    }

    if (isPistonSupported(fileToRun) && !['jsx', 'tsx', 'html'].includes(ext)) {
      const command = getExecutionCommand(fileToRun, ext);
      let finalCode = code;

      if (ext === 'java') {
        finalCode = finalCode.replace(/public\s+class/g, 'class');
      }

      setMockTerminalLogs([
        `$ ${command}`,
        { type: 'info', text: `Sending to Wandbox (${ext.toUpperCase()})...` }
      ]);
      setIsRunning(true);

      try {
        const result = await executeCode(fileToRun, finalCode, terminalStdin || "");
        const logs = [`$ ${command}`, ''];

        if (result.compile && result.compile.code !== 0) {
          logs.push({ type: 'error', text: result.compile.output || result.compile.stderr });
          logs.push({ type: 'info', text: `[Compilation failed with code ${result.compile.code}]` });
        } else if (result.run) {
          if (result.run.output) {
            logs.push({ type: 'text', text: result.run.output });
          }
          if (result.run.code !== 0) {
            logs.push({ type: 'error', text: `[Exit code ${result.run.code}]` });
          } else {
            logs.push({ type: 'info', text: `[Execution finished successfully ✓]` });
          }
        }

        setMockTerminalLogs(logs);
      } catch (error) {
        setMockTerminalLogs([
          `$ ${command}`,
          '',
          { type: 'error', text: `✗ ${error.message}` },
          { type: 'info', text: 'Check your internet connection and try again.' }
        ]);
      } finally {
        setIsRunning(false);
      }
    } else if (['jsx', 'tsx', 'html'].includes(ext)) {
      setMockTerminalLogs(null);
    } else {
      setMockTerminalLogs([
        { type: 'error', text: `✗ Cannot run file type: .${ext}` },
        { type: 'info', text: 'Supported: .py .js .ts .c .cpp .java .go .rs .php .rb .sh' }
      ]);
    }
  };

  const menuItems = [
    { label: 'File', onClick: () => setShowExplorer(!showExplorer) },
    { label: 'Edit', onClick: () => {} },
    { label: 'View', onClick: () => setShowExplorer(!showExplorer) },
    { label: 'Run', onClick: handleRun },
    { label: 'Terminal', onClick: () => setShowTerminal(!showTerminal) },
  ];

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 shrink-0 select-none"
      style={{
        background: 'linear-gradient(180deg, rgba(20,26,40,0.98) 0%, rgba(15,20,35,0.98) 100%)',
        borderBottom: '1px solid rgba(34,211,238,0.1)',
      }}
    >
      {/* Left: Menu Items */}
      <div className="flex items-center space-x-0.5">
        {menuItems.map(item => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="px-3 py-1 text-[13px] rounded transition-all duration-150 font-medium"
            style={{ 
              color: 'rgba(148,163,184,0.8)',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; e.currentTarget.style.background = 'transparent'; }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: Run Button */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="flex items-center px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 relative overflow-hidden"
        style={{
          background: isRunning
            ? 'rgba(34,211,238,0.1)'
            : 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.08) 100%)',
          border: '1px solid rgba(34,211,238,0.3)',
          color: isRunning ? 'rgba(34,211,238,0.6)' : '#22d3ee',
          boxShadow: isRunning ? 'none' : '0 0 12px rgba(34,211,238,0.1)',
          fontFamily: 'Space Grotesk, sans-serif',
          cursor: isRunning ? 'wait' : 'pointer',
        }}
        onMouseOver={e => { if (!isRunning) { e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.25)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)'; }}}
        onMouseOut={e => { e.currentTarget.style.boxShadow = isRunning ? 'none' : '0 0 12px rgba(34,211,238,0.1)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'; }}
      >
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 mr-2 fill-current" />
        )}
        {isRunning ? 'Running...' : 'Run'}
      </button>
    </div>
  );
};

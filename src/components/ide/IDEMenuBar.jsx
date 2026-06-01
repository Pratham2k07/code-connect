import React, { useState } from 'react';
import { useSandpack } from "@codesandbox/sandpack-react";
import { getExecutionCommand } from './utils';
import { Play, Settings, Menu, Terminal as TerminalIcon } from 'lucide-react';
import { PROJECT_TEMPLATES } from './projectTemplates';
import { executeCode, isPistonSupported } from '../../lib/piston';

export const IDEMenuBar = ({ setShowExplorer, showExplorer, setShowTerminal, showTerminal, setMockTerminalLogs, setSandpackFiles, setSandpackTemplate, terminalStdin, setActiveTerminalTab }) => {
  const { sandpack } = useSandpack();
  const [isRunning, setIsRunning] = useState(false);
  
  const handleRun = async () => {
    setShowTerminal(true);
    if (setActiveTerminalTab) setActiveTerminalTab('output');
    
    const activeFile = sandpack.activeFile;
    if (!activeFile) return; // Prevent crash if run clicked while workspace is empty
    const ext = activeFile.split('.').pop().toLowerCase();
    
    // Execute via Piston API for supported non-web languages
    if (isPistonSupported(activeFile) && !['js', 'jsx', 'ts', 'tsx', 'html'].includes(ext)) {
       const command = getExecutionCommand(activeFile, ext);
       const code = sandpack.files[activeFile]?.code || '';
       
       setMockTerminalLogs([
         `$ ${command}`,
         { type: 'info', text: 'Compiling and executing on remote sandbox...' }
       ]);
       setIsRunning(true);

       try {
         const result = await executeCode(activeFile, code, terminalStdin || "");
         
         const logs = [`$ ${command}`, ''];
         
         if (result.compile && result.compile.code !== 0) {
           logs.push({ type: 'error', text: result.compile.output || result.compile.stderr });
           logs.push({ type: 'info', text: `[Compilation failed with code ${result.compile.code}]` });
         } else if (result.run) {
           if (result.run.output) {
             logs.push({ type: 'text', text: result.run.output });
           }
           if (result.run.code !== 0) {
             logs.push({ type: 'error', text: `[Execution finished with code ${result.run.code}]` });
           } else {
             logs.push({ type: 'info', text: `[Execution finished successfully]` });
           }
         }
         
         setMockTerminalLogs(logs);
       } catch (error) {
         setMockTerminalLogs([
           `$ ${command}`,
           '',
           { type: 'error', text: `Failed to execute: ${error.message}` }
         ]);
       } finally {
         setIsRunning(false);
       }
    } else if (['js', 'jsx', 'ts', 'tsx', 'html'].includes(ext)) {
       // Let Sandpack naturally run JS/React projects in the invisible preview
       setMockTerminalLogs(null);
    } else {
       // Unrecognized or plain text file
       setMockTerminalLogs([
         { type: 'error', text: `Cannot run this file type: .${ext}` },
         { type: 'info', text: 'Please ensure your file has a valid programming language extension (e.g., .c, .py, .cpp, .java)' }
       ]);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-[#181818] text-gray-300 text-[13px] border-b border-gray-800 shrink-0 select-none relative">
      <div className="flex items-center space-x-1">
        <div className="px-3 py-1 hover:bg-white/10 cursor-pointer rounded transition-colors" onClick={() => setShowExplorer(!showExplorer)}>File</div>
        <div className="px-3 py-1 hover:bg-white/10 cursor-pointer rounded transition-colors">Edit</div>
        <div className="px-3 py-1 hover:bg-white/10 cursor-pointer rounded transition-colors" onClick={() => setShowExplorer(!showExplorer)}>View</div>
        <div className="px-3 py-1 hover:bg-white/10 cursor-pointer rounded transition-colors" onClick={handleRun}>Run</div>
        <div className="px-3 py-1 hover:bg-white/10 cursor-pointer rounded transition-colors" onClick={() => setShowTerminal(!showTerminal)}>Terminal</div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button onClick={handleRun} disabled={isRunning} className={`flex items-center px-3 py-1 ${isRunning ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded transition-colors`} title="Run Code">
          {isRunning ? (
            <div className="w-3.5 h-3.5 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 mr-1.5" />
          )}
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { mockChatMessages, mockPartner } from '../data/mockData';
import { Send, Sparkles, Code2, Users, FileCode2, Folder, File, ChevronDown, ChevronRight, Terminal, Plus, Play, Search, GitBranch, Blocks, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { SandpackProvider, SandpackPreview, SandpackConsole, useSandpack } from "@codesandbox/sandpack-react";
import { getLanguageFromExtension, getFileIcon, getExecutionCommand } from '../components/ide/utils';
import { IDETabs } from '../components/ide/IDETabs';
import { IDEMonacoEditor } from '../components/ide/IDEMonacoEditor';
import { IDEStatusBar } from '../components/ide/IDEStatusBar';
import { IDEFileExplorer } from '../components/ide/IDEFileExplorer';
import { IDEMenuBar } from '../components/ide/IDEMenuBar';
import { AIAssistant } from '../components/ide/AIAssistant';

const ActiveFileListener = ({ onActiveFileChange }) => {
  const { sandpack } = useSandpack();
  React.useEffect(() => {
    onActiveFileChange(sandpack.activeFile);
  }, [sandpack.activeFile, onActiveFileChange]);
  return null;
};
import { PROJECT_TEMPLATES } from '../components/ide/projectTemplates';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CollaborationRoom() {
  const { id: roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomMode, setRoomMode] = useState(location.state?.mode || 'coding');
  
  // Sandpack Files Setup & Templates
  const [sandpackTemplate, setSandpackTemplate] = useState('static');
  const [sandpackFiles, setSandpackFiles] = useState({
    '/index.html': { code: '', hidden: true },
  });
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  // Handlers for File Tabs
  const handleOpenFile = (path) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
  };

  const handleCloseFile = (path) => {
    setOpenFiles(openFiles.filter(f => f !== path));
  };

  const addNewIDEFile = (path) => {
    setSandpackFiles(prev => {
      // Append the new file without destroying others
      return {
        ...prev,
        [path]: { code: '' }
      };
    });
  };

  const customSetup = React.useMemo(() => ({
    dependencies: { "framer-motion": "latest" }
  }), []);

  const channelRef = useRef(null);

  // Chat State
  const partnerChat = mockChatMessages.filter(msg => msg.sender === 'user' || msg.sender === 'partner');

  const [partnerMessages, setPartnerMessages] = useState(partnerChat);
  const [partnerInput, setPartnerInput] = useState('');
  
  // Tab state for the right panel in coding mode
  const [activeTab, setActiveTab] = useState('ai'); // 'team' or 'ai'

  // Resizing state
  const [rightWidth, setRightWidth] = useState(25); // 25% for the side panel
  const [explorerWidth, setExplorerWidth] = useState(200); // 200px for file explorer
  const [terminalHeight, setTerminalHeight] = useState(250); // 250px for terminal
  
  // Toggle states
  const [showTerminal, setShowTerminal] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const [mockTerminalLogs, setMockTerminalLogs] = useState(null);
  const [terminalStdin, setTerminalStdin] = useState('');
  const [activeTerminalTab, setActiveTerminalTab] = useState('output'); // 'output' or 'input'

  const isDraggingRight = useRef(false);
  const isDraggingExplorer = useRef(false);
  const isDraggingTerminal = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (roomMode === 'discussion') return;

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isDraggingRight.current) {
          const newRightWidth = ((containerRect.width - (e.clientX - containerRect.left)) / containerRect.width) * 100;
          setRightWidth(Math.max(20, Math.min(newRightWidth, 50)));
        }
        if (isDraggingExplorer.current) {
          const newExplorerWidth = e.clientX - containerRect.left;
          setExplorerWidth(Math.max(150, Math.min(newExplorerWidth, 400)));
        }
        if (isDraggingTerminal.current) {
          const newTerminalHeight = containerRect.bottom - e.clientY;
          setTerminalHeight(Math.max(100, Math.min(newTerminalHeight, 600)));
        }
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRight.current = false;
      isDraggingExplorer.current = false;
      isDraggingTerminal.current = false;
      document.body.style.cursor = 'default';
      document.body.classList.remove('select-none');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [roomMode]);

  useEffect(() => {
    if (!roomId) return;
    
    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        broadcast: { self: false }
      }
    });
    
    channel.on('broadcast', { event: 'chat-message' }, (payload) => {
      setPartnerMessages(prev => [...prev, payload.payload.message]);
    });
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Joined room:', roomId);
      }
    });
    
    channelRef.current = channel;
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);



  const handleSendPartner = () => {
    if (!partnerInput.trim()) return;
    const newMessage = { id: Date.now(), sender: 'user', text: partnerInput, timestamp: 'Now' };
    setPartnerMessages([...partnerMessages, newMessage]);
    setPartnerInput('');

    if (channelRef.current) {
      const broadcastMessage = { ...newMessage, sender: 'partner', id: Date.now() + 1 };
      channelRef.current.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: { message: broadcastMessage }
      });
    }
  };

  const renderPartnerChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {partnerMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] text-textMuted mb-1 ml-1">{msg.sender === 'user' ? 'You' : mockPartner.name}</div>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-primary text-background rounded-tr-sm shadow-lg shadow-primary/20' 
                : 'bg-card border border-cardBorder text-textMain rounded-tl-sm'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 shrink-0 pt-2 border-t border-cardBorder">
        <input
          type="text"
          value={partnerInput}
          onChange={e => setPartnerInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendPartner()}
          placeholder={`Message ${mockPartner.name}...`}
          className="flex-1 bg-background border border-cardBorder rounded-xl px-3 py-2 focus:outline-none focus:border-primary/50 text-sm transition-colors min-w-0"
        />
        <Button onClick={handleSendPartner} className="px-3 h-[38px] shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
  return (
    <div className="h-screen w-screen z-10 relative flex flex-col overflow-hidden bg-background pt-[72px]">
      
      {roomMode === 'discussion' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col flex-1 h-full max-w-5xl mx-auto w-full space-y-6"
        >
          <div className="text-center mt-4 mb-2">
            <h2 className="text-4xl font-black text-textMain mb-2">Brainstorming Session</h2>
            <p className="text-textMuted text-lg">Discuss with <span className="text-primary font-semibold">{mockPartner.name}</span> and Antigravity AI to decide what to build!</p>
          </div>
          
          <div className="flex flex-1 gap-6 min-h-0">
             <GlassCard gradient="linear-gradient(137deg, #10B981 0%, #059669 100%)" className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-bold flex items-center mb-4 text-textMain shrink-0">
                  <Users className="w-6 h-6 mr-3 text-primary" /> Team Chat
                </h3>
                {renderPartnerChat()}
             </GlassCard>

             <GlassCard gradient="linear-gradient(137deg, #F59E0B 0%, #D97706 100%)" className="flex flex-col flex-1 p-6 bg-transparent">
                <h3 className="text-xl font-bold flex items-center mb-4 text-secondary shrink-0">
                  <Terminal className="w-6 h-6 mr-3 text-secondary animate-pulse" /> Antigravity AI
                </h3>
                {renderAIChat()}
             </GlassCard>
          </div>
          
          <div className="flex justify-center shrink-0 mt-4 pb-4">
             <Button 
                onClick={() => setRoomMode('coding')} 
                className="px-10 py-5 text-xl font-bold shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] group"
             >
               We've Decided! Open Antigravity IDE 
               <Code2 className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" />
             </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          ref={containerRef} 
          className="flex flex-1 min-h-0 relative w-full overflow-hidden bg-[#0d1117]"
        >
          
          {/* Main IDE Area (Explorer + Code) */}
          <div style={{ width: `${100 - rightWidth}%` }} className="flex h-full relative">
            <SandpackProvider 
                template={sandpackTemplate} 
                theme="dark" 
                files={sandpackFiles}
                customSetup={customSetup}
                className="w-full h-full flex"
            >
              <ActiveFileListener onActiveFileChange={setActiveFile} />
              <div className="w-full h-full flex flex-1 bg-[#0d1117]">
                
                {/* VS Code Activity Bar */}
                <div className="w-12 bg-[#181818] border-r border-gray-800 flex flex-col items-center py-2 shrink-0 z-10">
                  <div className="p-2 mb-2 text-white border-l-2 border-white cursor-pointer hover:text-white" onClick={() => setShowExplorer(!showExplorer)}><FileCode2 className="w-6 h-6" /></div>
                  <div className="p-2 mb-2 text-gray-500 hover:text-white cursor-pointer transition-colors"><Search className="w-6 h-6" /></div>
                  <div className="p-2 mb-2 text-gray-500 hover:text-white cursor-pointer transition-colors"><GitBranch className="w-6 h-6" /></div>
                  <div className="p-2 mb-2 text-gray-500 hover:text-white cursor-pointer transition-colors" onClick={() => setShowTerminal(!showTerminal)}><Play className="w-6 h-6" /></div>
                  <div className="p-2 mb-2 text-gray-500 hover:text-white cursor-pointer transition-colors"><Blocks className="w-6 h-6" /></div>
                  <div className="mt-auto p-2 text-gray-500 hover:text-white cursor-pointer transition-colors"><Settings className="w-6 h-6" /></div>
                </div>

                {/* File Explorer Sidebar */}
                {showExplorer && (
                  <div style={{ width: `${explorerWidth - 48}px`, minWidth: '150px' }} className="flex flex-col bg-[#111827] border-r border-gray-800 shrink-0 h-full overflow-hidden shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 relative">
                     <IDEFileExplorer openFile={handleOpenFile} addNewIDEFile={addNewIDEFile} />
                  </div>
                )}

                {/* Explorer Resizer */}
                {showExplorer && (
                  <div 
                    className="w-1 cursor-col-resize hover:bg-blue-500 bg-transparent transition-colors z-20 absolute top-0 bottom-0"
                    style={{ left: `${explorerWidth}px`, transform: 'translateX(-50%)' }}
                    onMouseDown={() => {
                      isDraggingExplorer.current = true;
                      document.body.style.cursor = 'col-resize';
                      document.body.classList.add('select-none');
                    }}
                  />
                )}

                {/* Code Editor & Terminal */}
                <div className="flex flex-col flex-1 w-full h-full min-w-0 overflow-hidden bg-[#0d1117] relative">
                  {/* IDE Menu Bar */}
                  <IDEMenuBar 
                    setShowExplorer={setShowExplorer}
                    showExplorer={showExplorer}
                    setShowTerminal={setShowTerminal}
                    showTerminal={showTerminal}
                    setMockTerminalLogs={setMockTerminalLogs}
                    setSandpackFiles={setSandpackFiles}
                    setSandpackTemplate={setSandpackTemplate}
                    terminalStdin={terminalStdin}
                    setActiveTerminalTab={setActiveTerminalTab}
                  />

                  {/* IDE Tabs */}
                  {openFiles.length > 0 && (
                    <IDETabs openFiles={openFiles} closeFile={handleCloseFile} />
                  )}

                  {/* Monaco Editor Component or Welcome Screen */}
                  {openFiles.length > 0 ? (
                    <IDEMonacoEditor />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] text-gray-500 min-h-0 select-none">
                       <h2 className="text-4xl font-black mb-4 text-gray-700">Antigravity IDE</h2>
                       <p className="text-sm">Create a new file in the Explorer to begin.</p>
                    </div>
                  )}
                  
                  {/* Terminal Section (Conditionally Rendered) */}
                  {showTerminal && (
                    <>
                      <div 
                        className="h-1 cursor-row-resize hover:bg-blue-500 bg-gray-800 transition-colors shrink-0 z-20 relative"
                        onMouseDown={() => {
                          isDraggingTerminal.current = true;
                          document.body.style.cursor = 'row-resize';
                          document.body.classList.add('select-none');
                        }}
                      />
                      <div style={{ height: `${terminalHeight}px` }} className="bg-[#111827] flex flex-col shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] z-10 relative">
                        <div className="px-4 py-1.5 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#0d1117]">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-200 border-b border-gray-400 pb-1 -mb-1.5 font-bold">Terminal</span>
                            <span 
                              onClick={() => setActiveTerminalTab('output')}
                              className={`cursor-pointer transition-colors pb-1 -mb-1.5 border-b ${activeTerminalTab === 'output' ? 'text-gray-200 border-blue-400' : 'hover:text-gray-200 border-transparent'}`}
                            >
                              Output
                            </span>
                            <span 
                              onClick={() => setActiveTerminalTab('input')}
                              className={`cursor-pointer transition-colors pb-1 -mb-1.5 border-b ${activeTerminalTab === 'input' ? 'text-gray-200 border-blue-400' : 'hover:text-gray-200 border-transparent'}`}
                            >
                              Stdin
                            </span>
                          </div>
                          <button onClick={() => setShowTerminal(false)} className="hover:text-white font-bold text-sm">✕</button>
                        </div>
                        
                        {activeTerminalTab === 'input' ? (
                          <div className="flex-1 p-2 bg-[#0d1117] flex flex-col">
                             <div className="text-xs text-gray-500 mb-2 px-2">Enter standard input (stdin) before running the program:</div>
                             <textarea 
                               className="flex-1 bg-transparent border border-gray-800 rounded p-2 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                               value={terminalStdin}
                               onChange={(e) => setTerminalStdin(e.target.value)}
                               placeholder="e.g. 5\n10 20 30"
                             />
                          </div>
                        ) : mockTerminalLogs ? (
                          <div className="flex-1 p-4 font-mono text-sm text-gray-300 bg-[#0d1117] overflow-y-auto whitespace-pre-wrap">
                            {mockTerminalLogs.map((log, i) => (
                              <div key={i} className={(typeof log === 'string' && log.startsWith('$')) ? 'text-blue-400 font-bold mb-1' : log.type === 'error' ? 'text-red-400' : log.type === 'info' ? 'text-gray-400' : 'text-gray-100'}>
                                {log.text || log}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <SandpackConsole style={{ flex: 1, backgroundColor: '#0d1117' }} />
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Status Bar */}
                  <IDEStatusBar isSimulating={!!mockTerminalLogs} />
                </div>

                <div className="hidden">
                  <SandpackPreview />
                </div>
              </div>
            </SandpackProvider>
          </div>

          {/* Right Panel Resizer */}
          <div 
            className="w-2 cursor-col-resize hover:bg-primary/30 bg-cardBorder transition-colors z-20 shrink-0"
            onMouseDown={() => {
              isDraggingRight.current = true;
              document.body.style.cursor = 'col-resize';
              document.body.classList.add('select-none');
            }}
          />

          {/* Right Panel: Antigravity AI + Team Chat */}
          <div style={{ width: `${rightWidth}%` }} className="flex flex-col h-full bg-[#111827] border-l border-gray-800 shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 shrink-0 bg-[#0d1117]">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${
                  activeTab === 'ai' 
                    ? 'text-secondary border-t-2 border-secondary bg-[#111827]' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Terminal className="w-4 h-4 mr-2" /> Antigravity AI
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center transition-colors ${
                  activeTab === 'team' 
                    ? 'text-primary border-t-2 border-primary bg-[#111827]' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2" /> Team Chat
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'ai' && <AIAssistant activeFile={activeFile} files={sandpackFiles} />}
              {activeTab === 'team' && <div className="p-4 flex-1 overflow-hidden">{renderPartnerChat()}</div>}
            </div>
          </div>
          
        </motion.div>
      )}
    </div>
  );
}

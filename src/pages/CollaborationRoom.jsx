import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { mockChatMessages, mockPartner } from '../data/mockData';
import { Send, Sparkles, Code2, Users, FileCode2, Folder, File, ChevronDown, ChevronRight, Terminal, Plus, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CollaborationRoom() {
  const { id: roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomMode, setRoomMode] = useState(location.state?.mode || 'coding');
  
  // File System State
  const [files, setFiles] = useState([
    { name: 'App.jsx', language: 'javascript', content: `import React, { useState } from 'react';\nimport { Antigravity } from '@ai/core';\n\nexport default function App() {\n  const [code, setCode] = useState("");\n\n  return (\n    <div className="flex h-screen">\n      <h1 className="text-primary">\n        Coding with ${mockPartner.name}!\n      </h1>\n    </div>\n  );\n}` },
    { name: 'index.css', language: 'css', content: 'body {\n  margin: 0;\n  background: #0d1117;\n  color: #fff;\n}' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState('Antigravity Terminal v1.0.0\nReady.\n');
  const [terminalHeight, setTerminalHeight] = useState(200);

  const channelRef = useRef(null);

  // Chat State
  const partnerChat = mockChatMessages.filter(msg => msg.sender === 'user' || msg.sender === 'partner');
  const aiChat = mockChatMessages.filter(msg => msg.sender === 'ai');

  const [partnerMessages, setPartnerMessages] = useState(partnerChat);
  const [aiMessages, setAiMessages] = useState(aiChat);
  const [partnerInput, setPartnerInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  
  // Tab state for the right panel in coding mode
  const [activeTab, setActiveTab] = useState('ai'); // 'team' or 'ai'

  // Resizing state
  const [rightWidth, setRightWidth] = useState(25); // 25% for the side panel
  const [explorerWidth, setExplorerWidth] = useState(200); // 200px for file explorer
  
  // Toggle states
  const [showTerminal, setShowTerminal] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);

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
    
    channel.on('broadcast', { event: 'code-change' }, (payload) => {
      setFiles(prev => {
        const newFiles = [...prev];
        if (newFiles[payload.payload.fileIndex]) {
          newFiles[payload.payload.fileIndex].content = payload.payload.code;
        }
        return newFiles;
      });
    });

    channel.on('broadcast', { event: 'file-add' }, (payload) => {
      setFiles(prev => [...prev, payload.payload.file]);
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

  const handleEditorChange = (value) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].content = value;
    setFiles(newFiles);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'code-change',
        payload: { fileIndex: activeFileIndex, code: value }
      });
    }
  };

  const handleAddFile = (e) => {
    if (e.key !== 'Enter') return;
    if (!newFileName.trim()) {
      setIsAddingFile(false);
      return;
    }
    
    let lang = 'plaintext';
    if (newFileName.endsWith('.js') || newFileName.endsWith('.jsx')) lang = 'javascript';
    else if (newFileName.endsWith('.ts') || newFileName.endsWith('.tsx')) lang = 'typescript';
    else if (newFileName.endsWith('.css')) lang = 'css';
    else if (newFileName.endsWith('.html')) lang = 'html';
    else if (newFileName.endsWith('.py')) lang = 'python';
    else if (newFileName.endsWith('.json')) lang = 'json';
    
    const newFile = { name: newFileName.trim(), language: lang, content: '' };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileIndex(updatedFiles.length - 1);
    setNewFileName('');
    setIsAddingFile(false);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'file-add',
        payload: { file: newFile }
      });
    }
  };

  const handleRunCode = () => {
    const file = files[activeFileIndex];
    setShowTerminal(true);
    setTerminalOutput(prev => prev + `\n$ node ${file.name}\nRunning ${file.name}...\nSuccess! Process exited with code 0.\n`);
  };

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

  const handleSendAi = () => {
    if (!aiInput.trim()) return;
    setAiMessages([...aiMessages, { id: Date.now(), sender: 'user', text: aiInput, timestamp: 'Now' }]);
    setAiInput('');
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

  const renderAIChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
          {aiMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] text-textMuted mb-1 ml-1">{msg.sender === 'user' ? 'You' : 'Antigravity'}</div>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-secondary text-background rounded-tr-sm shadow-lg shadow-secondary/20' 
                : 'bg-secondary/10 border border-secondary/30 text-textMain rounded-tl-sm'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 shrink-0 pt-2 border-t border-cardBorder">
        <input
          type="text"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendAi()}
          placeholder="Ask Antigravity to generate code..."
          className="flex-1 bg-background border border-cardBorder rounded-xl px-3 py-2 focus:outline-none focus:border-secondary/50 text-sm transition-colors min-w-0"
        />
        <Button onClick={handleSendAi} className="px-3 h-[38px] bg-secondary hover:bg-secondary/80 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen pt-20 px-2 sm:px-4 pb-4 max-w-[1800px] mx-auto w-full z-10 relative flex flex-col overflow-hidden">
      
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
          className="flex flex-1 min-h-0 relative w-full rounded-xl overflow-hidden border border-cardBorder shadow-[0_0_50px_rgba(34,211,238,0.1)] bg-[#0d1117]"
        >
          
          {/* Main IDE Area (Explorer + Code) */}
          <div style={{ width: `${100 - rightWidth}%` }} className="flex h-full relative">
            
            {/* File Explorer Sidebar */}
            {showExplorer && (
              <div style={{ width: `${explorerWidth}px` }} className="flex flex-col bg-[#111827] border-r border-gray-800 shrink-0 h-full overflow-hidden">
                 <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between">
                   <span>Explorer</span>
                   <button onClick={() => setIsAddingFile(true)} className="hover:text-white transition-colors" title="New File">
                     <Plus className="w-4 h-4" />
                   </button>
                 </div>
               <div className="py-2 space-y-0.5 text-gray-300 text-sm overflow-y-auto custom-scrollbar flex-1">
                 <div className="flex items-center px-4 py-1.5 hover:bg-white/5 cursor-pointer">
                   <ChevronDown className="w-4 h-4 mr-1 opacity-70" />
                   <Folder className="w-4 h-4 mr-2 text-blue-400" />
                   <span>src</span>
                 </div>
                 
                 {files.map((file, idx) => (
                   <div 
                     key={idx}
                     onClick={() => setActiveFileIndex(idx)}
                     className={`flex items-center px-4 py-1.5 pl-8 cursor-pointer ${activeFileIndex === idx ? 'bg-white/10 text-white border-l-2 border-secondary' : 'hover:bg-white/5'}`}
                   >
                      <File className={`w-4 h-4 mr-2 ${file.language === 'javascript' ? 'text-blue-400' : file.language === 'css' ? 'text-yellow-400' : 'text-green-400'}`} />
                      <span className="truncate">{file.name}</span>
                   </div>
                 ))}

                 {isAddingFile && (
                   <div className="flex items-center px-4 py-1.5 pl-8">
                     <File className="w-4 h-4 mr-2 text-gray-500" />
                     <input
                       autoFocus
                       type="text"
                       value={newFileName}
                       onChange={e => setNewFileName(e.target.value)}
                       onKeyDown={handleAddFile}
                       onBlur={() => setIsAddingFile(false)}
                       className="bg-transparent border border-secondary/50 rounded px-1 w-full text-white text-sm outline-none"
                       placeholder="filename.js"
                     />
                   </div>
                 )}
               </div>
              </div>
            )}

            {/* Explorer Resizer */}
            {showExplorer && (
              <div 
                className="w-1 cursor-col-resize hover:bg-secondary/50 bg-transparent transition-colors z-20 absolute top-0 bottom-0"
                style={{ left: `${explorerWidth}px`, transform: 'translateX(-50%)' }}
                onMouseDown={() => {
                  isDraggingExplorer.current = true;
                  document.body.style.cursor = 'col-resize';
                  document.body.classList.add('select-none');
                }}
              />
            )}

            {/* Code Editor & Terminal */}
            <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#0d1117]">
              
              {/* IDE Menu Bar */}
              <div className="flex items-center justify-between px-2 py-0.5 bg-[#111827] text-gray-400 text-[13px] border-b border-gray-800 shrink-0 select-none">
                <div className="flex items-center">
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">File</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Edit</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Selection</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors" onClick={() => setShowExplorer(!showExplorer)}>View</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Go</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors" onClick={handleRunCode}>Run</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors" onClick={() => setShowTerminal(!showTerminal)}>Terminal</div>
                  <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Help</div>
                </div>
                <button 
                  onClick={handleRunCode}
                  className="flex items-center text-secondary hover:text-white px-3 py-1 bg-secondary/10 hover:bg-secondary/30 rounded transition-colors mr-2"
                >
                  <Play className="w-3 h-3 mr-1" /> Run
                </button>
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center bg-[#111827] border-b border-gray-800 overflow-x-auto hide-scrollbar">
                {files.map((file, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`flex items-center px-4 py-2 cursor-pointer text-sm shrink-0 ${activeFileIndex === idx ? 'bg-[#0d1117] text-white border-t-2 border-secondary border-r border-gray-800' : 'text-gray-500 hover:text-gray-300 border-r border-gray-800/50'}`}
                  >
                    <File className={`w-4 h-4 mr-2 ${file.language === 'javascript' ? 'text-blue-400' : file.language === 'css' ? 'text-yellow-400' : 'text-green-400'}`} /> 
                    {file.name}
                  </div>
                ))}
              </div>
              
              {/* Code Content */}
              <div className="flex flex-col flex-1 overflow-hidden bg-[#0d1117]">
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={files[activeFileIndex].language}
                    theme="vs-dark"
                    value={files[activeFileIndex].content}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      padding: { top: 16 }
                    }}
                  />
                </div>
                
                {/* Terminal Section (Conditionally Rendered) */}
                {showTerminal && (
                  <>
                    <div 
                      className="h-1 cursor-row-resize hover:bg-secondary/50 bg-gray-800 transition-colors shrink-0"
                      onMouseDown={() => {
                        isDraggingTerminal.current = true;
                        document.body.style.cursor = 'row-resize';
                        document.body.classList.add('select-none');
                      }}
                    />
                    
                    <div style={{ height: `${terminalHeight}px` }} className="bg-[#111827] flex flex-col shrink-0">
                      <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#0d1117]">
                        <span>Terminal</span>
                        <div className="flex gap-3">
                          <button onClick={() => setTerminalOutput('')} className="hover:text-white">Clear</button>
                          <button onClick={() => setShowTerminal(false)} className="hover:text-white font-bold text-sm">✕</button>
                        </div>
                      </div>
                      <div className="p-3 font-mono text-[13px] text-gray-300 overflow-y-auto whitespace-pre-wrap flex-1 custom-scrollbar">
                        {terminalOutput}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {activeTab === 'ai' ? renderAIChat() : renderPartnerChat()}
            </div>
          </div>
          
        </motion.div>
      )}
    </div>
  );
}

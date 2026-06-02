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
    '/package.json': { code: '{}', hidden: true },
    '/styles.css': { code: '', hidden: true },
  });
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  // Handlers for File Tabs
  const handleOpenFile = (path) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setActiveFile(path);
  };

  const handleCloseFile = (path) => {
    const newOpenFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newOpenFiles);
    if (activeFile === path) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
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

  const [partnerMessages, setPartnerMessages] = useState([]);
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
  const editorRef = useRef(null); // shared ref to Monaco editor instance

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

  // Fetch initial messages
  useEffect(() => {
    if (!roomId) return;
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        const mapped = data.map(msg => ({
          id: msg.id,
          sender: msg.sender_id === user?.id ? 'user' : 'partner',
          text: msg.text,
          timestamp: msg.created_at
        }));
        setPartnerMessages(mapped);
      }
    };
    
    fetchMessages();
  }, [roomId, user?.id]);

  // Subscribe to real-time message inserts
  useEffect(() => {
    if (!roomId) return;
    
    const channel = supabase.channel(`room_messages_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new;
          setPartnerMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              sender: msg.sender_id === user?.id ? 'user' : 'partner',
              text: msg.text,
              timestamp: msg.created_at
            }];
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time messages for room:', roomId);
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id]);



  const handleSendPartner = async () => {
    if (!partnerInput.trim() || !user) return;
    
    const text = partnerInput.trim();
    setPartnerInput('');
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    setPartnerMessages(prev => [...prev, { id: tempId, sender: 'user', text, timestamp: 'Now' }]);
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        text: text
      })
      .select()
      .single();
      
    if (data && !error) {
       // Replace optimistic message with the real one to get the true UUID
       setPartnerMessages(prev => prev.map(m => m.id === tempId ? {
          id: data.id,
          sender: 'user',
          text: data.text,
          timestamp: data.created_at
       } : m));
    } else {
       console.error("Failed to send message:", error);
    }
  };

  const renderPartnerChat = () => (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-3 custom-scrollbar">
        {partnerMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              <Users className="w-5 h-5" style={{ color: 'rgba(34,211,238,0.5)' }} />
            </div>
            <p className="text-xs text-center" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}>
              No messages yet.<br />Say hi to your partner!
            </p>
          </div>
        )}
        {partnerMessages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] mb-1 font-medium"
              style={{ color: msg.sender === 'user' ? 'rgba(34,211,238,0.5)' : 'rgba(244,114,182,0.5)', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {msg.sender === 'user' ? 'You' : mockPartner.name}
            </div>
            <div
              className="max-w-[90%] px-3 py-2 rounded-xl text-[13px] leading-relaxed"
              style={msg.sender === 'user' ? {
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.06))',
                border: '1px solid rgba(34,211,238,0.2)',
                color: '#f8fafc',
                borderBottomRightRadius: '4px',
                fontFamily: 'Space Grotesk, sans-serif',
              } : {
                background: 'rgba(20,26,40,0.7)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#e2e8f0',
                borderBottomLeftRadius: '4px',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={partnerInput}
            onChange={e => setPartnerInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPartner()}
            placeholder={`Message ${mockPartner.name}...`}
            className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none transition-all duration-200 min-w-0"
            style={{
              background: 'rgba(20,26,40,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
          <button
            onClick={handleSendPartner}
            className="p-2.5 rounded-xl transition-all duration-200 shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.08))',
              border: '1px solid rgba(34,211,238,0.3)',
              color: '#22d3ee',
            }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(34,211,238,0.2)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'; }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
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
          transition={{ duration: 0.3 }}
          ref={containerRef} 
          className="flex flex-1 min-h-0 relative w-full overflow-hidden"
          style={{ background: '#0b0f19' }}
        >
          <SandpackProvider 
              template={sandpackTemplate} 
              theme="dark" 
              files={sandpackFiles}
              customSetup={customSetup}
          >
          <div className="flex w-full h-full relative">
          
          {/* Main IDE Area (Explorer + Code) */}
          <div style={{ width: `${100 - rightWidth}%` }} className="flex h-full relative">
              <div className="w-full h-full flex flex-1 bg-[#0d1117]">
                
                {/* VS Code-style Activity Bar */}
                <div className="w-12 flex flex-col items-center py-3 shrink-0 z-10"
                  style={{ background: 'rgba(10,14,23,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="p-2 mb-1 cursor-pointer rounded-lg transition-all duration-200 relative"
                    onClick={() => setShowExplorer(!showExplorer)}
                    title="Explorer"
                    style={{ color: showExplorer ? '#22d3ee' : 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => { if (!showExplorer) e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; }}
                    onMouseOut={e => { if (!showExplorer) e.currentTarget.style.color = 'rgba(148,163,184,0.4)'; }}
                  >
                    {showExplorer && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full -ml-2" style={{ background: '#22d3ee', boxShadow: '0 0 6px rgba(34,211,238,0.6)' }} />}
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div className="p-2 mb-1 cursor-pointer rounded-lg transition-all duration-200"
                    title="Search"
                    style={{ color: 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                  >
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="p-2 mb-1 cursor-pointer rounded-lg transition-all duration-200"
                    title="Source Control"
                    style={{ color: 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                  >
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div
                    className="p-2 mb-1 cursor-pointer rounded-lg transition-all duration-200"
                    onClick={() => setShowTerminal(!showTerminal)}
                    title="Terminal"
                    style={{ color: showTerminal ? '#4ade80' : 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => { if (!showTerminal) e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; }}
                    onMouseOut={e => { if (!showTerminal) e.currentTarget.style.color = 'rgba(148,163,184,0.4)'; }}
                  >
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="p-2 mb-1 cursor-pointer rounded-lg transition-all duration-200"
                    title="Extensions"
                    style={{ color: 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                  >
                    <Blocks className="w-5 h-5" />
                  </div>
                  <div className="mt-auto p-2 cursor-pointer rounded-lg transition-all duration-200"
                    title="Settings"
                    style={{ color: 'rgba(148,163,184,0.4)' }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(148,163,184,0.8)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                  >
                    <Settings className="w-5 h-5" />
                  </div>
                </div>

                {/* File Explorer Sidebar */}
                {showExplorer && (
                  <div style={{ width: `${explorerWidth - 48}px`, minWidth: '150px' }}
                    className="flex flex-col shrink-0 h-full overflow-hidden z-10 relative"
                    style2={{ boxShadow: '4px 0 20px rgba(0,0,0,0.5)' }}
                  >
                    <IDEFileExplorer openFile={handleOpenFile} />
                  </div>
                )}

                {/* Explorer Resizer */}
                {showExplorer && (
                  <div
                    className="w-1 cursor-col-resize z-20 absolute top-0 bottom-0 transition-all duration-150"
                    style={{ left: `${explorerWidth}px`, transform: 'translateX(-50%)', background: 'transparent' }}
                    onMouseDown={() => { isDraggingExplorer.current = true; document.body.style.cursor = 'col-resize'; document.body.classList.add('select-none'); }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(34,211,238,0.4)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
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
                    editorRef={editorRef}
                    activeFilePath={activeFile}
                  />

                  {/* IDE Tabs */}
                  {openFiles.length > 0 && (
                    <IDETabs openFiles={openFiles} closeFile={handleCloseFile} activeFilePath={activeFile} setActiveFilePath={(path) => {
                      setActiveFile(path);
                      // Fallback sync
                      const sp = document.querySelector('iframe');
                      if(sp) sp.contentWindow.postMessage({ type: 'activate_file', path }, '*');
                    }} />
                  )}

                  {/* Monaco Editor Component or Welcome Screen */}
                  {openFiles.length > 0 ? (
                    <IDEMonacoEditor editorRef={editorRef} activeFilePath={activeFile} />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0 select-none"
                      style={{ background: '#0b0f19' }}
                    >
                      {/* Subtle grid */}
                      <div className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34,211,238,0.04) 1px, transparent 0)',
                          backgroundSize: '40px 40px',
                        }}
                      />
                      {/* Glow blob */}
                      <div className="absolute w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)', top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }}
                      />
                      <div className="relative z-10 text-center px-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(244,114,182,0.05))',
                            border: '1px solid rgba(34,211,238,0.15)',
                            boxShadow: '0 0 30px rgba(34,211,238,0.08)',
                          }}
                        >
                          <FileCode2 className="w-7 h-7" style={{ color: 'rgba(34,211,238,0.5)' }} />
                        </div>
                        <h2 className="text-3xl font-black mb-3"
                          style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            background: 'linear-gradient(135deg, #22d3ee 0%, #f472b6 60%, #4ade80 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Antigravity IDE
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'Space Grotesk, sans-serif' }}>
                          Create a new file in the Explorer to start coding
                        </p>
                        <div className="flex items-center justify-center gap-3 text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
                          <span className="px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'JetBrains Mono, monospace' }}>Click + in Explorer</span>
                          <span>to create a file</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Terminal Section */}
                  {showTerminal && (
                    <>
                      <div
                        className="h-1 cursor-row-resize shrink-0 z-20 relative transition-all duration-150"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                        onMouseDown={() => { isDraggingTerminal.current = true; document.body.style.cursor = 'row-resize'; document.body.classList.add('select-none'); }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(34,211,238,0.4)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      />
                      <div style={{ height: `${terminalHeight}px` }}
                        className="flex flex-col shrink-0 z-10 relative"
                        style2={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}
                      >
                        {/* Terminal header */}
                        <div className="px-4 py-2 flex items-center justify-between shrink-0"
                          style={{
                            background: 'rgba(10,14,23,0.98)',
                            borderTop: '1px solid rgba(34,211,238,0.1)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#22d3ee', fontFamily: 'Space Grotesk, sans-serif' }}>
                              Terminal
                            </span>
                            <button
                              onClick={() => setActiveTerminalTab('output')}
                              className="text-[11px] transition-colors pb-0.5 font-medium"
                              style={{
                                color: activeTerminalTab === 'output' ? '#f8fafc' : 'rgba(148,163,184,0.4)',
                                borderBottom: activeTerminalTab === 'output' ? '1px solid #22d3ee' : '1px solid transparent',
                                fontFamily: 'Space Grotesk, sans-serif',
                              }}
                            >
                              Output
                            </button>
                            <button
                              onClick={() => setActiveTerminalTab('input')}
                              className="text-[11px] transition-colors pb-0.5 font-medium"
                              style={{
                                color: activeTerminalTab === 'input' ? '#f8fafc' : 'rgba(148,163,184,0.4)',
                                borderBottom: activeTerminalTab === 'input' ? '1px solid #22d3ee' : '1px solid transparent',
                                fontFamily: 'Space Grotesk, sans-serif',
                              }}
                            >
                              Stdin
                            </button>
                          </div>
                          <button
                            onClick={() => setShowTerminal(false)}
                            className="text-[12px] w-5 h-5 flex items-center justify-center rounded transition-all duration-150"
                            style={{ color: 'rgba(148,163,184,0.4)' }}
                            onMouseOver={e => { e.currentTarget.style.color = '#f472b6'; e.currentTarget.style.background = 'rgba(244,114,182,0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Terminal Body */}
                        {activeTerminalTab === 'input' ? (
                          <div className="flex-1 p-3 flex flex-col" style={{ background: '#0b0f19' }}>
                            <div className="text-[11px] mb-2 px-1" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'Space Grotesk, sans-serif' }}>
                              Enter standard input (stdin) before running:
                            </div>
                            <textarea
                              className="flex-1 p-3 text-sm font-mono resize-none outline-none rounded-lg"
                              style={{
                                background: 'rgba(20,26,40,0.6)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: '#e2e8f0',
                                fontFamily: 'JetBrains Mono, monospace',
                              }}
                              value={terminalStdin}
                              onChange={e => setTerminalStdin(e.target.value)}
                              placeholder="e.g. 5\n10 20 30"
                              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                            />
                          </div>
                        ) : mockTerminalLogs ? (
                          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar whitespace-pre-wrap"
                            style={{ background: '#080c14', color: '#e2e8f0' }}
                          >
                            {mockTerminalLogs.map((log, i) => (
                              <div key={i} className={
                                (typeof log === 'string' && log.startsWith('$'))
                                  ? 'font-bold mb-2'
                                  : log.type === 'error' ? '' : log.type === 'info' ? '' : ''
                              } style={{
                                color: (typeof log === 'string' && log.startsWith('$'))
                                  ? '#22d3ee'
                                  : log.type === 'error' ? '#f87171'
                                  : log.type === 'info' ? 'rgba(148,163,184,0.6)'
                                  : '#e2e8f0',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '13px',
                              }}>
                                {log.text || log}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <SandpackConsole style={{ flex: 1, backgroundColor: '#080c14' }} />
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
          </div>

          {/* Right Panel Resizer */}
          <div
            className="w-1.5 cursor-col-resize z-20 shrink-0 transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            onMouseDown={() => { isDraggingRight.current = true; document.body.style.cursor = 'col-resize'; document.body.classList.add('select-none'); }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(244,114,182,0.4)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          />

          {/* Right Panel: AI + Team Chat */}
          <div style={{ width: `${rightWidth}%` }}
            className="flex flex-col h-full shrink-0"
            style2={{ background: '#080c14', borderLeft: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Tab Bar */}
            <div className="flex shrink-0"
              style={{
                background: 'rgba(10,14,23,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <button
                onClick={() => setActiveTab('ai')}
                className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center transition-all duration-200 relative"
                style={{
                  color: activeTab === 'ai' ? '#f472b6' : 'rgba(148,163,184,0.4)',
                  background: activeTab === 'ai' ? 'rgba(244,114,182,0.05)' : 'transparent',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {activeTab === 'ai' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #f472b6, transparent)' }}
                  />
                )}
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Antigravity AI
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center transition-all duration-200 relative"
                style={{
                  color: activeTab === 'team' ? '#22d3ee' : 'rgba(148,163,184,0.4)',
                  background: activeTab === 'team' ? 'rgba(34,211,238,0.05)' : 'transparent',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {activeTab === 'team' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }}
                  />
                )}
                <Users className="w-3.5 h-3.5 mr-1.5" /> Team Chat
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#0b0f19' }}>
              {activeTab === 'ai' && <AIAssistant />}
              {activeTab === 'team' && (
                <div className="p-4 flex-1 overflow-hidden" style={{ background: '#0b0f19' }}>
                  {renderPartnerChat()}
                </div>
              )}
            </div>
          </div>
          </div>
          </SandpackProvider>
        </motion.div>
      )}
    </div>
  );
}

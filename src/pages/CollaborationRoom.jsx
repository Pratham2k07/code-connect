import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { mockChatMessages, mockPartner } from '../data/mockData';
import { Send, Sparkles, Code2, Users, FileCode2, Folder, File, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';

export function CollaborationRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomMode, setRoomMode] = useState(location.state?.mode || 'coding');

  // Filter messages for partner and AI
  const partnerChat = mockChatMessages.filter(msg => msg.sender === 'user' || msg.sender === 'partner');
  const aiChat = mockChatMessages.filter(msg => msg.sender === 'ai');

  const [partnerMessages, setPartnerMessages] = useState(partnerChat);
  const [aiMessages, setAiMessages] = useState(aiChat);
  const [partnerInput, setPartnerInput] = useState('');
  const [aiInput, setAiInput] = useState('');
  
  // Tab state for the right panel in coding mode
  const [activeTab, setActiveTab] = useState('ai'); // 'team' or 'ai'

  // Resizing state
  const [rightWidth, setRightWidth] = useState(30); // 30% for the side panel
  const [explorerWidth, setExplorerWidth] = useState(250); // 250px for file explorer
  
  const isDraggingRight = useRef(false);
  const isDraggingExplorer = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (roomMode === 'discussion') return;

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        
        if (isDraggingRight.current) {
          const newRightWidth = ((containerWidth - e.clientX) / containerWidth) * 100;
          setRightWidth(Math.max(20, Math.min(newRightWidth, 50)));
        }
        if (isDraggingExplorer.current) {
          const newExplorerWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
          setExplorerWidth(Math.max(150, Math.min(newExplorerWidth, 400)));
        }
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRight.current = false;
      isDraggingExplorer.current = false;
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

  const handleSendPartner = () => {
    if (!partnerInput.trim()) return;
    setPartnerMessages([...partnerMessages, { id: Date.now(), sender: 'user', text: partnerInput, timestamp: 'Now' }]);
    setPartnerInput('');
  };

  const handleSendAi = () => {
    if (!aiInput.trim()) return;
    setAiMessages([...aiMessages, { id: Date.now(), sender: 'user', text: aiInput, timestamp: 'Now' }]);
    setAiInput('');
  };

  // -----------------------------------------------------
  // CHAT UI FRAGMENTS
  // -----------------------------------------------------
  const PartnerChatContent = () => (
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

  const AIChatContent = () => (
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
        // -----------------------------------------------------
        // DISCUSSION MODE
        // -----------------------------------------------------
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
                <PartnerChatContent />
             </GlassCard>

             <GlassCard gradient="linear-gradient(137deg, #F59E0B 0%, #D97706 100%)" className="flex flex-col flex-1 p-6 bg-transparent">
                <h3 className="text-xl font-bold flex items-center mb-4 text-secondary shrink-0">
                  <Terminal className="w-6 h-6 mr-3 text-secondary animate-pulse" /> Antigravity AI
                </h3>
                <AIChatContent />
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
        // -----------------------------------------------------
        // CODING MODE (Antigravity IDE Layout)
        // -----------------------------------------------------
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          ref={containerRef} 
          className="flex flex-1 min-h-0 relative w-full rounded-xl overflow-hidden border border-cardBorder shadow-[0_0_50px_rgba(34,211,238,0.1)] bg-[#0d1117]"
        >
          
          {/* Main IDE Area (Explorer + Code) */}
          <div style={{ width: `${100 - rightWidth}%` }} className="flex h-full relative">
            
            {/* File Explorer Sidebar */}
            <div style={{ width: `${explorerWidth}px` }} className="flex flex-col bg-[#111827] border-r border-gray-800 shrink-0 h-full overflow-y-auto">
               <div className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between">
                 <span>Explorer</span>
                 <Terminal className="w-4 h-4 text-secondary" />
               </div>
               <div className="py-2 space-y-0.5 text-gray-300 text-sm truncate">
                 <div className="flex items-center px-4 py-1.5 hover:bg-white/5 cursor-pointer">
                   <ChevronDown className="w-4 h-4 mr-1 opacity-70" />
                   <Folder className="w-4 h-4 mr-2 text-blue-400" />
                   <span>src</span>
                 </div>
                 <div className="flex items-center px-4 py-1.5 pl-8 hover:bg-white/5 cursor-pointer bg-white/10 text-white border-l-2 border-secondary">
                    <FileCode2 className="w-4 h-4 mr-2 text-blue-400" />
                    <span>App.jsx</span>
                 </div>
                 <div className="flex items-center px-4 py-1.5 pl-8 hover:bg-white/5 cursor-pointer">
                    <File className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>index.css</span>
                 </div>
                 <div className="flex items-center px-4 py-1.5 hover:bg-white/5 cursor-pointer mt-2">
                   <ChevronRight className="w-4 h-4 mr-1 opacity-70" />
                   <Folder className="w-4 h-4 mr-2 text-blue-400" />
                   <span>public</span>
                 </div>
                 <div className="flex items-center px-4 py-1.5 pl-8 hover:bg-white/5 cursor-pointer">
                    <File className="w-4 h-4 mr-2 text-green-400" />
                    <span>package.json</span>
                 </div>
               </div>
            </div>

            {/* Explorer Resizer */}
            <div 
              className="w-1 cursor-col-resize hover:bg-secondary/50 bg-transparent transition-colors z-20 absolute top-0 bottom-0"
              style={{ left: `${explorerWidth}px`, transform: 'translateX(-50%)' }}
              onMouseDown={() => {
                isDraggingExplorer.current = true;
                document.body.style.cursor = 'col-resize';
                document.body.classList.add('select-none');
              }}
            />

            {/* Code Editor */}
            <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#0d1117]">
              
              {/* IDE Menu Bar */}
              <div className="flex items-center px-2 py-0.5 bg-[#111827] text-gray-400 text-[13px] border-b border-gray-800 shrink-0 select-none">
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">File</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Edit</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Selection</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">View</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Go</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Run</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Terminal</div>
                <div className="px-3 py-1 hover:bg-white/10 hover:text-gray-200 cursor-pointer rounded transition-colors">Help</div>
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center bg-[#111827] border-b border-gray-800">
                <div className="flex items-center px-4 py-2 bg-[#0d1117] text-white border-t-2 border-secondary border-r border-gray-800 text-sm">
                  <FileCode2 className="w-4 h-4 mr-2 text-blue-400" /> App.jsx
                </div>
                <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-300 cursor-pointer text-sm">
                  <File className="w-4 h-4 mr-2 text-yellow-400" /> index.css
                </div>
              </div>
              
              {/* Code Content */}
              <div className="flex flex-1 overflow-hidden bg-[#0d1117]">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  defaultValue={`import React, { useState } from 'react';\nimport { Antigravity } from '@ai/core';\n\nexport default function App() {\n  const [code, setCode] = useState("");\n\n  return (\n    <div className="flex h-screen">\n      <h1 className="text-primary">\n        Coding with ${mockPartner.name}!\n      </h1>\n    </div>\n  );\n}`}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    padding: { top: 16 }
                  }}
                />
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
              {activeTab === 'ai' ? <AIChatContent /> : <PartnerChatContent />}
            </div>
          </div>
          
        </motion.div>
      )}
    </div>
  );
}

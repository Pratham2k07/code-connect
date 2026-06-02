import React, { useState, useEffect, useRef } from 'react';
import { Send, Key, Settings, Loader2, Bot, User, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { askAntigravity } from '../../lib/ai';
import { useSandpack } from "@codesandbox/sandpack-react";

export const AIAssistant = () => {
  const { sandpack } = useSandpack();
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isWritingFile, setIsWritingFile] = useState(null); // file path being written

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm **Antigravity AI** — your agentic coding assistant.\n\nI can see your current file and **write code directly into your IDE**. Ask me to build a feature, create a file, or fix a bug and I'll do it automatically!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowSettings(true);
    }
  }, []);

  const saveApiKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
      setApiKey(tempKey.trim());
      setShowSettings(false);
      setTempKey('');
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setShowSettings(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isWaiting) return;
    if (!apiKey) { setShowSettings(true); return; }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setIsWaiting(true);

    try {
      const context = {};
      if (sandpack.activeFile && sandpack.files && sandpack.files[sandpack.activeFile]) {
        context.filename = sandpack.activeFile;
        context.code = sandpack.files[sandpack.activeFile].code;
      }

      const sandpackCallbacks = {
        editFile: (path, code) => {
          setIsWritingFile(path);
          setTimeout(() => {
            if (sandpack.addFile) {
              sandpack.addFile(path, code);
            } else {
              sandpack.updateFile(path, code);
            }
            sandpack.setActiveFile(path);
            setIsWritingFile(null);
          }, 300);
        }
      };

      const response = await askAntigravity(apiKey, userMessage, context, messages, sandpackCallbacks);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        text: `**Error**: ${error.message || 'Failed to connect to AI.'}`
      }]);
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#0b0f19' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(20,26,40,0.98) 0%, rgba(15,20,35,0.96) 100%)',
          borderBottom: '1px solid rgba(244,114,182,0.15)',
        }}
      >
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 relative"
            style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(34,211,238,0.1))', border: '1px solid rgba(244,114,182,0.3)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#f472b6' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
              Antigravity AI
            </h2>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80', boxShadow: '0 0 4px rgba(74,222,128,0.8)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(74,222,128,0.8)' }}>Agentic Mode</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg transition-all duration-150"
          style={{ color: 'rgba(148,163,184,0.5)' }}
          onMouseOver={e => { e.currentTarget.style.color = '#f472b6'; e.currentTarget.style.background = 'rgba(244,114,182,0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,15,25,0.9)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'rgba(20,26,40,0.95)',
              border: '1px solid rgba(244,114,182,0.2)',
              boxShadow: '0 0 40px rgba(244,114,182,0.1), 0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3"
                style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)' }}
              >
                <Key className="w-4 h-4" style={{ color: '#f472b6' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
                API Configuration
              </h3>
            </div>
            <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(148,163,184,0.8)' }}>
              Provide your Google Gemini API Key to enable Antigravity AI. Your key is stored securely in your browser's Local Storage.
            </p>

            {apiKey ? (
              <div className="space-y-3">
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}
                >
                  ✓ API Key is configured
                </div>
                <button onClick={clearApiKey}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                >
                  Remove API Key
                </button>
                <button onClick={() => setShowSettings(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={tempKey}
                  onChange={e => setTempKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveApiKey()}
                  placeholder="Paste Gemini API Key here..."
                  className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(11,15,25,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(244,114,182,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(244,114,182,0.05)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  onClick={saveApiKey}
                  disabled={!tempKey.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,114,182,0.3), rgba(34,211,238,0.2))',
                    border: '1px solid rgba(244,114,182,0.3)',
                    color: '#f8fafc',
                    fontFamily: 'Space Grotesk, sans-serif',
                    opacity: tempKey.trim() ? 1 : 0.4,
                    cursor: tempKey.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Save & Connect
                </button>
                <div className="text-center">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                    className="text-xs transition-colors"
                    style={{ color: 'rgba(34,211,238,0.6)' }}
                    onMouseOver={e => e.currentTarget.style.color = '#22d3ee'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(34,211,238,0.6)'}
                  >
                    Get a free Gemini API key here →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ background: '#0b0f19' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center mb-1.5 space-x-1.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(34,211,238,0.1))'
                    : 'linear-gradient(135deg, rgba(244,114,182,0.3), rgba(244,114,182,0.1))',
                  border: msg.sender === 'user' ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(244,114,182,0.3)',
                }}
              >
                {msg.sender === 'user'
                  ? <User className="w-3 h-3" style={{ color: '#22d3ee' }} />
                  : <Sparkles className="w-3 h-3" style={{ color: '#f472b6' }} />
                }
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: msg.sender === 'user' ? 'rgba(34,211,238,0.6)' : 'rgba(244,114,182,0.6)' }}
              >
                {msg.sender === 'user' ? 'You' : 'Antigravity'}
              </span>
            </div>
            <div
              className="max-w-[95%] p-3 rounded-xl text-[13px] leading-relaxed"
              style={msg.sender === 'user' ? {
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0.06) 100%)',
                border: '1px solid rgba(34,211,238,0.2)',
                color: '#f8fafc',
                borderBottomRightRadius: '4px',
              } : {
                background: 'rgba(20,26,40,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#e2e8f0',
                borderBottomLeftRadius: '4px',
              }}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{msg.text}</div>
              ) : (
                <div className="markdown-body text-[13px]">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="rounded-xl overflow-hidden my-2" style={{ border: '1px solid rgba(34,211,238,0.15)' }}>
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, fontSize: '12px', background: '#080c14', padding: '12px 16px' }}
                            />
                          </div>
                        ) : (
                          <code {...props} className="px-1.5 py-0.5 rounded text-[12px]"
                            style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {children}
                          </code>
                        );
                      },
                      p({ children }) { return <p className="mb-2 last:mb-0" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{children}</p>; },
                      ul({ children }) { return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>; },
                      ol({ children }) { return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>; },
                      strong({ children }) { return <strong style={{ color: '#f8fafc', fontWeight: 700 }}>{children}</strong>; },
                      a({ href, children }) { return <a href={href} target="_blank" rel="noreferrer" style={{ color: '#22d3ee' }}>{children}</a>; }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Writing File Indicator */}
        {isWritingFile && (
          <div className="flex items-start">
            <div className="px-4 py-3 rounded-xl flex items-center space-x-2.5"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
            >
              <Zap className="w-4 h-4 animate-pulse" style={{ color: '#4ade80' }} />
              <span className="text-[13px]" style={{ color: 'rgba(74,222,128,0.9)', fontFamily: 'Space Grotesk, sans-serif' }}>
                Writing to <span style={{ color: '#4ade80', fontWeight: 600 }}>{isWritingFile}</span>...
              </span>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isWaiting && !isWritingFile && (
          <div className="flex items-start">
            <div className="px-4 py-3 rounded-xl flex items-center space-x-2.5"
              style={{ background: 'rgba(20,26,40,0.8)', border: '1px solid rgba(244,114,182,0.15)' }}
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#f472b6' }} />
              <span className="text-[13px]" style={{ color: 'rgba(148,163,184,0.8)', fontFamily: 'Space Grotesk, sans-serif' }}>
                Antigravity is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 shrink-0"
        style={{
          background: 'rgba(15,20,35,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <form onSubmit={handleSend}
          className="relative flex items-end rounded-xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(20,26,40,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(244,114,182,0.3)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder={sandpack.activeFile
              ? `Ask about ${sandpack.activeFile.split('/').pop()} or say "build me a..."` 
              : "Ask Antigravity to build something..."}
            className="w-full bg-transparent text-[13px] px-4 py-3 max-h-36 outline-none resize-none custom-scrollbar"
            style={{ color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif', minHeight: '46px' }}
            rows="1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isWaiting}
            className="p-2.5 mb-1.5 mr-1.5 rounded-lg transition-all duration-200"
            style={{
              background: input.trim() && !isWaiting ? 'linear-gradient(135deg, rgba(244,114,182,0.3), rgba(34,211,238,0.2))' : 'transparent',
              border: '1px solid',
              borderColor: input.trim() && !isWaiting ? 'rgba(244,114,182,0.4)' : 'rgba(255,255,255,0.06)',
              color: input.trim() && !isWaiting ? '#f472b6' : 'rgba(148,163,184,0.3)',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.35)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Antigravity can make mistakes. Verify important code.
          </span>
        </div>
      </div>
    </div>
  );
};

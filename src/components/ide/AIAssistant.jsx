import React, { useState, useEffect, useRef } from 'react';
import { Send, Key, Settings, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { askAntigravity } from '../../lib/ai';

export const AIAssistant = ({ activeFile, files }) => {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am Antigravity AI. I can see your code and help you build this project. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Load API key on mount
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaiting]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isWaiting) return;

    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setIsWaiting(true);

    try {
      // Gather context
      const context = {};
      if (activeFile && files && files[activeFile]) {
        context.filename = activeFile;
        context.code = files[activeFile].code;
      }

      const response = await askAntigravity(apiKey, userMessage, context, messages);
      
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
    <div className="flex flex-col h-full bg-[#111827] text-gray-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 shrink-0 bg-[#1f2937]">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-pink-500" />
          <h2 className="text-sm font-semibold text-white">Antigravity AI</h2>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1f2937] border border-gray-700 p-5 rounded-lg shadow-2xl w-full max-w-sm">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <Key className="w-4 h-4 mr-2" /> API Configuration
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              To use the AI assistant natively in your browser, please provide a free Google Gemini API Key. Your key is stored securely in your browser's Local Storage.
            </p>
            
            {apiKey ? (
              <div className="space-y-4">
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded">
                  API Key is currently configured.
                </div>
                <button 
                  onClick={clearApiKey}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm transition-colors"
                >
                  Remove API Key
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="password"
                  value={tempKey}
                  onChange={e => setTempKey(e.target.value)}
                  placeholder="Paste Gemini API Key here..."
                  className="w-full bg-[#111827] border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
                />
                <button 
                  onClick={saveApiKey}
                  disabled={!tempKey.trim()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                >
                  Save & Connect
                </button>
              </div>
            )}
            
            {!apiKey && (
              <div className="mt-4 text-center">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                  Get a free Gemini API key here &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0d1117]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center mb-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {msg.sender === 'user' ? 'You' : 'Antigravity'}
              </span>
            </div>
            <div 
              className={`max-w-[95%] p-3 rounded-lg text-[13px] leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-[#1f2937] text-gray-200 border border-gray-700 rounded-tl-none'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="markdown-body text-[13px]">
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="rounded-md overflow-hidden my-2 border border-gray-800">
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, fontSize: '12px', background: '#090c10' }}
                            />
                          </div>
                        ) : (
                          <code {...props} className="bg-white/10 px-1 py-0.5 rounded text-pink-400">
                            {children}
                          </code>
                        )
                      },
                      p({children}) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      ul({children}) {
                        return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                      },
                      ol({children}) {
                        return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                      },
                      a({href, children}) {
                        return <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{children}</a>;
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isWaiting && (
          <div className="flex items-start">
            <div className="bg-[#1f2937] border border-gray-700 rounded-lg rounded-tl-none p-4 shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              <span className="text-xs text-gray-400 font-medium">Antigravity is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-800 bg-[#1f2937] shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end bg-[#111827] rounded-md border border-gray-700 focus-within:border-pink-500/50 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={activeFile ? `Ask about ${activeFile.split('/').pop()}...` : "Ask Antigravity..."}
            className="w-full bg-transparent text-white text-[13px] px-3 py-2.5 max-h-32 outline-none resize-none custom-scrollbar"
            rows="1"
            style={{ minHeight: '44px' }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isWaiting}
            className="p-2 mb-1 mr-1 text-pink-500 hover:text-pink-400 disabled:text-gray-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-500">Antigravity AI can make mistakes. Check important code.</span>
        </div>
      </div>
    </div>
  );
};

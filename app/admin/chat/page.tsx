'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { 
  PaperAirplaneIcon, 
  DocumentIcon, 
  UserIcon, 
  SparklesIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for deterministic hydration
  attachments?: { name: string; type: string }[];
  extractedData?: any;
}

export default function EquitieBotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm the EQUITIE bot. I can help you with:
      
• Extract fee profiles from term sheets
• Parse investor data from Excel/CSV files
• Analyze deal documents with AI
• Answer questions about your Supabase data
• Process screenshots and PDFs with OCR

Upload a document or ask me anything about fee calculations, investor management, or deal structures!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      attachments: attachedFile ? [{ name: attachedFile.name, type: attachedFile.type }] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      if (attachedFile) {
        formData.append('file', attachedFile);
      }

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I processed your request.',
        timestamp: new Date().toISOString(),
        extractedData: data.extractedData
      };

      setMessages(prev => [...prev, assistantMessage]);
      setAttachedFile(null);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your OpenRouter API key is configured in .env.local',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  const exportData = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-data.json';
    a.click();
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }).format(d);
  };

  const formatContent = (content: string) => {
    // Format bullet points, lists, and links
    return content.split('\n').map((line, i) => {
      // Format headers with ===
      if (line.startsWith('===')) {
        return (
          <div key={i} className="font-semibold text-primary-300 mt-3 mb-2">
            {line.replace(/=/g, '')}
          </div>
        );
      }
      
      // Format bold headers with **
      if (line.includes('**') && line.includes(':**')) {
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={i} className="font-semibold text-white mt-3 mb-2" 
               dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      
      // Format links [text](url)
      if (line.includes('[') && line.includes('](')) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const formatted = line.replace(linkRegex, (match, text, url) => {
          return `<a href="${url}" class="text-primary-300 hover:text-primary-400 underline">${text}</a>`;
        });
        
        // Handle bullet points with links
        if (line.startsWith('•')) {
          return (
            <div key={i} className="ml-4 mb-1" 
                 dangerouslySetInnerHTML={{ __html: formatted }} />
          );
        }
        
        return (
          <div key={i} className="mb-1" 
               dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      }
      
      // Regular bullet points
      if (line.startsWith('•')) {
        return (
          <div key={i} className="ml-4 mb-1">
            {line}
          </div>
        );
      }
      
      // Regular lines
      return (
        <div key={i} className="mb-1">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background-deep">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-primary-300" />
              <div>
                <h1 className="text-3xl font-bold text-white">EQUITIE Bot</h1>
                <p className="text-sm text-gray-400">AI-powered document analysis and data extraction</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-surface border border-surface-border rounded-lg text-white hover:bg-surface-hover flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <Card variant="glass" className="h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-primary-300/20 text-primary-300' 
                    : 'bg-gradient-to-r from-primary-300 to-secondary-blue text-white'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon className="w-5 h-5" />
                  ) : (
                    <SparklesIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block text-left rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-300/20 text-white'
                      : 'bg-surface border border-surface-border text-white'
                  }`}>
                    {/* Attachments */}
                    {message.attachments && (
                      <div className="mb-2 flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {message.attachments[0].name}
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <div className="text-sm whitespace-pre-wrap">
                      {formatContent(message.content)}
                    </div>

                    {/* Extracted Data */}
                    {message.extractedData && (
                      <div className="mt-3 pt-3 border-t border-surface-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Extracted Data</span>
                          <button
                            onClick={() => exportData(message.extractedData)}
                            className="text-xs text-primary-300 hover:text-primary-400 flex items-center gap-1"
                          >
                            <ArrowDownTrayIcon className="w-3 h-3" />
                            Export JSON
                          </button>
                        </div>
                        <pre className="text-xs bg-surface-dark p-2 rounded overflow-x-auto">
                          {JSON.stringify(message.extractedData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-1 px-1" suppressHydrationWarning>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-300 to-secondary-blue flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="bg-surface border border-surface-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-300 border-t-transparent" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Area (Toggle) */}
          {showUpload && (
            <div className="border-t border-surface-border p-4">
              <FileUploadZone
                onFileSelect={(file) => {
                  setAttachedFile(file);
                  setShowUpload(false);
                }}
                onTextExtracted={() => {}}
                purpose="profile"
              />
            </div>
          )}

          {/* Attached File Display */}
          {attachedFile && !showUpload && (
            <div className="px-6 py-2 border-t border-surface-border">
              <div className="flex items-center justify-between bg-surface-dark rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{attachedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-surface-border p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`p-2.5 rounded-lg border transition-all ${
                  showUpload || attachedFile
                    ? 'bg-primary-300/20 border-primary-300 text-primary-300'
                    : 'bg-surface border-surface-border text-gray-400 hover:text-white'
                }`}
                title="Attach file"
              >
                <DocumentIcon className="w-5 h-5" />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about fee structures, upload documents, or paste data..."
                className="flex-1 px-4 py-2.5 bg-surface border border-surface-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-primary-300 to-secondary-blue text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Send
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setInput('Extract fee profile from this document')}
                className="text-xs px-3 py-1.5 bg-surface border border-surface-border rounded-full text-gray-400 hover:text-white hover:border-primary-300"
              >
                Extract Profile
              </button>
              <button
                onClick={() => setInput('Parse investor data from CSV')}
                className="text-xs px-3 py-1.5 bg-surface border border-surface-border rounded-full text-gray-400 hover:text-white hover:border-primary-300"
              >
                Parse Investors
              </button>
              <button
                onClick={() => setInput('Calculate fees for Deal ID 1')}
                className="text-xs px-3 py-1.5 bg-surface border border-surface-border rounded-full text-gray-400 hover:text-white hover:border-primary-300"
              >
                Calculate Fees
              </button>
              <button
                onClick={() => setInput('Show me the database schema')}
                className="text-xs px-3 py-1.5 bg-surface border border-surface-border rounded-full text-gray-400 hover:text-white hover:border-primary-300"
              >
                Show Schema
              </button>
            </div>
          </div>
        </Card>

        {/* Info Panel */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card variant="glass" className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Supported Files</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• PDF documents</li>
              <li>• Excel/CSV files</li>
              <li>• Images (PNG/JPG)</li>
              <li>• Text files</li>
            </ul>
          </Card>
          
          <Card variant="glass" className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">AI Capabilities</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Extract fee structures</li>
              <li>• Parse investor data</li>
              <li>• OCR for screenshots</li>
              <li>• Answer questions</li>
            </ul>
          </Card>
          
          <Card variant="glass" className="p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Tips</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Drag & drop files</li>
              <li>• Use Shift+Enter for new line</li>
              <li>• Export data as JSON</li>
              <li>• Max file size: 10MB</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
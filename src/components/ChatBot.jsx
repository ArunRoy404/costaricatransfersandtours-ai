import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Copy, Check, Maximize2, Minimize2, FlaskConical, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const createSessionId = () => (
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
);

const getInitialSessionId = () => {
  const storedSessionId = localStorage.getItem('chat_session_id');
  if (storedSessionId) return storedSessionId;

  const newSessionId = createSessionId();
  localStorage.setItem('chat_session_id', newSessionId);
  return newSessionId;
};

const ChatBot = ({ externalOpen, setExternalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLarge, setIsLarge] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      type: 'bot', 
      content: 'Hola! I’m New, your dedicated Costa Rica tours & transportation specialist. How can I help you plan your perfect trip today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [isTestMode, setIsTestMode] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const PRODUCTION_URL = 'https://orunroy.app.n8n.cloud/webhook/7b7486f4-381a-42ac-baa6-4b78ff4346b1';
  const TEST_URL = 'https://orunroy.app.n8n.cloud/webhook-test/7b7486f4-381a-42ac-baa6-4b78ff4346b1';

  const webhookUrl = isTestMode ? TEST_URL : PRODUCTION_URL;

  const resetChat = () => {
    const newSessionId = createSessionId();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([
      {
        id: Date.now().toString(),
        type: 'bot',
        content: '¡Hola! I am Neo, your Costa Rica travel assistant. How can I help you plan your perfect trip today?'
      }
    ]);
  };

  const toggleMode = () => {
    setIsTestMode(prev => !prev);
    resetChat();
  };

  // Handle external trigger
  useEffect(() => {
    if (externalOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        if (setExternalOpen) setExternalOpen(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [externalOpen, setExternalOpen]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim()
    };

    const sentContent = input.trim();

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: userMessage.content,
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const rawText = await response.text();
      let replyText = rawText;

      // Try to parse JSON responses from n8n webhook
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Array format: extract message or response from first item
          replyText = parsed[0].message || parsed[0].response || replyText;
        } else if (typeof parsed === 'object') {
          // Object format: extract message or response field
          replyText = parsed.message || parsed.response || replyText;
        }
      } catch {
        // Not JSON, use raw text as-is
      }
      
      if (!replyText) {
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        setErrorMsg('Failed to get a response. Please try again.');
        setInput(sentContent);
      } else {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: replyText
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setErrorMsg('Connection error. Please check your internet and try again.');
      setInput(sentContent);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chatbot-container ${isLarge ? 'is-large' : ''}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`chatbot-window ${isLarge ? 'large' : ''}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <img src="/neo-crtt.jpeg" alt="Neo" className="chatbot-avatar-img" />
                </div>
                <div className="chatbot-title-block">
                  <h3>Neo AI</h3>
                  <div className="chatbot-status">
                    {isTestMode ? 'Test Mode' : 'Online'}
                    <span className={`mode-badge ${isTestMode ? 'test' : 'production'}`}>
                      {isTestMode ? 'TEST' : 'LIVE'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button
                  className={`chatbot-action-btn mode-toggle ${isTestMode ? 'test' : 'production'}`}
                  onClick={toggleMode}
                  title={isTestMode ? 'Switch to Production' : 'Switch to Test Mode'}
                  aria-label={isTestMode ? 'Switch to Production' : 'Switch to Test Mode'}
                >
                  {isTestMode ? <FlaskConical size={17} /> : <Radio size={17} />}
                </button>
                <button 
                  className="chatbot-action-btn" 
                  onClick={() => setIsLarge(!isLarge)}
                  title={isLarge ? "Small view" : "Large view"}
                  aria-label={isLarge ? "Small view" : "Large view"}
                >
                  {isLarge ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button className="chatbot-action-btn close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  className={`message message-${msg.type}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {msg.type === 'bot' ? (
                    <>
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-node-type={node?.type}
                              />
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <button
                        className={`message-copy-btn ${copiedId === msg.id ? 'copied' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      <button
                        className={`message-copy-btn ${copiedId === msg.id ? 'copied' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="message message-bot">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              {errorMsg && (
                <div className="chatbot-error-msg">{errorMsg}</div>
              )}
              <div className="chatbot-input-row">
                <textarea
                  ref={textareaRef}
                  className="chatbot-textarea"
                  placeholder="Type your message..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                />
                <button 
                  className="chatbot-send" 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatBot;

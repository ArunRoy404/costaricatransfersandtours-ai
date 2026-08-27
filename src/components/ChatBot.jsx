import { useState, useEffect, useRef } from 'react';
import { ArrowUp, Minus, MessageCircle, Copy, Check, Maximize2, Minimize2, FlaskConical, Radio, Bot, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import './ChatBot.css';

// Ensure all links inside sanitized HTML open in a new tab safely
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

let msgCounter = 0;
const generateMsgId = (prefix = 'msg') => `${prefix}_${Date.now()}_${++msgCounter}`;

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

import QuickActions from './QuickActions';

const HAS_HTML_RE = /<[a-z][\s\S]*>/i;

const isHtmlContent = (str) => typeof str === 'string' && HAS_HTML_RE.test(str);

const getStatusSequence = (input) => {
  const text = (input || '').toLowerCase();

  if (/transfer|airport|shuttle|pickup|flight|van|drive|taxi|car|sjo|lir|private transfer/.test(text)) {
    return [
      'Searching transfer routes & airport schedules...',
      'Calculating vehicle options & private rates...',
      'Checking pickup & destination timing...',
      'Preparing transfer recommendations...'
    ];
  }

  if (/boat|charter|catamaran|sailing|fishing|snorkeling|cruise|yacht|ocean/.test(text)) {
    return [
      'Searching boat charters & marine fleet...',
      'Checking captain availability & ocean routes...',
      'Verifying charter inclusions & pricing...',
      'Curating boat charter options...'
    ];
  }

  if (/tour|beach|volcano|zipline|adventure|hike|rafting|rainforest|jungle|national park|canopy|wildlife|animal|sloth|waterfall/.test(text)) {
    return [
      'Searching tours & adventure database...',
      'Checking real-time availability & excursion rates...',
      'Analyzing top-rated guides & itinerary spots...',
      'Formatting tour recommendations...'
    ];
  }

  if (/book|price|cost|rate|quote|reserve|checkout|pay|package|itinerary/.test(text)) {
    return [
      'Connecting to travel inventory database...',
      'Checking real-time pricing & package rates...',
      'Verifying availability & inclusions...',
      'Preparing booking details...'
    ];
  }

  return [
    'Searching Costa Rica travel database...',
    'Analyzing travel preferences & availability...',
    'Matching best recommendations...',
    'Finalizing response...'
  ];
};

const ChatBot = ({ externalOpen, setExternalOpen, showModeToggle }) => {
  const wpConfig = typeof window !== 'undefined' ? (window.NeoChatbotConfig || {}) : {};
  const PRODUCTION_URL = wpConfig.productionUrl || 'https://ai.costaricatransfersandtours.com/webhook/neo';
  const TEST_URL = wpConfig.testUrl || 'https://ai.costaricatransfersandtours.com/webhook-test/neo';
  const botName = wpConfig.botName || 'Neo AI';

  const isModeToggleVisible = showModeToggle !== undefined 
    ? Boolean(showModeToggle) 
    : Boolean(wpConfig.showModeToggle);

  const [isOpen, setIsOpen] = useState(Boolean(wpConfig.initialOpen));
  const [isLarge, setIsLarge] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const statusTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [isTestMode, setIsTestMode] = useState(() => wpConfig.defaultMode === 'test');
  const [copiedId, setCopiedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const webhookUrl = isTestMode ? TEST_URL : PRODUCTION_URL;

  const hasUserMessages = messages.length > 0;

  const resetChat = () => {
    if (statusTimerRef.current) {
      clearInterval(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    const newSessionId = createSessionId();
    localStorage.setItem('chat_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setStatusText('');
  };

  const toggleMode = () => {
    setIsTestMode(prev => !prev);
    resetChat();
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    };
  }, []);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, statusText, isLoading]);

  const sendMessageToWebhook = async (chatInput, action) => {
    const userMessage = {
      id: generateMsgId('user'),
      type: 'user',
      content: chatInput
    };

    setMessages(prev => [...prev, userMessage]);
    if (action !== 'quickAction') {
      setInput('');
    }

    // Start sequential status indicator
    const stages = getStatusSequence(chatInput);
    setStatusText(stages[0]);
    setIsLoading(true);
    setErrorMsg('');

    if (statusTimerRef.current) {
      clearInterval(statusTimerRef.current);
    }
    let stageIndex = 0;
    statusTimerRef.current = setInterval(() => {
      stageIndex++;
      if (stageIndex < stages.length) {
        setStatusText(stages[stageIndex]);
      }
    }, 4000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          chatInput: chatInput,
          sessionId: sessionId,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const rawText = await response.text();
      let replyText = rawText;
      let suggestions = [];

      // Try to parse JSON responses from n8n webhook
      try {
        const parsed = JSON.parse(rawText);
        const data = Array.isArray(parsed) && parsed.length > 0 
          ? parsed[0] 
          : (typeof parsed === 'object' && parsed !== null ? parsed : null);

        if (data) {
          // Extract reply content (supports html, message, response, text)
          replyText = data.html || data.message || data.response || data.text || replyText;

          // Extract suggestions (supports ai_suggestions, aiSuggestions, suggestions)
          const rawSuggestions = data.ai_suggestions || data.aiSuggestions || data.suggestions;
          if (Array.isArray(rawSuggestions)) {
            suggestions = rawSuggestions.filter(item => typeof item === 'string' && item.trim().length > 0);
          }

          // Extract and sync session_id
          const newSessionId = data.session_id || data.sessionId;
          if (newSessionId && typeof newSessionId === 'string') {
            setSessionId(newSessionId);
            localStorage.setItem('chat_session_id', newSessionId);
          }
        }
      } catch {
        // Not JSON, use raw text as-is
      }
      
      if (!replyText) {
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        setErrorMsg('Failed to get a response. Please try again.');
        if (action === 'sendMessage') {
          setInput(chatInput);
        }
      } else {
        const botMessage = {
          id: generateMsgId('bot'),
          type: 'bot',
          content: replyText,
          suggestions: suggestions
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setErrorMsg('Connection error. Please check your internet and try again.');
      if (action === 'sendMessage') {
        setInput(chatInput);
      }
    } finally {
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
        statusTimerRef.current = null;
      }
      setIsLoading(false);
      setStatusText('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessageToWebhook(input.trim(), 'sendMessage');
  };

  const handleQuickAction = async (chatInput) => {
    if (isLoading) return;
    await sendMessageToWebhook(chatInput, 'quickAction');
  };

  const handleSuggestionClick = async (suggestionText) => {
    if (isLoading || !suggestionText) return;
    await sendMessageToWebhook(suggestionText, 'sendMessage');
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
                <div className="chatbot-avatar" aria-label="Neo AI Bot">
                  <Bot size={25} className="chatbot-avatar-icon" />
                </div>
                <div className="chatbot-title-block">
                  <h3>{botName}</h3>
                  <div className="chatbot-status">
                    {isModeToggleVisible && isTestMode ? 'Test Mode' : 'Online'}
                    {isModeToggleVisible && (
                      <span className={`mode-badge ${isTestMode ? 'test' : 'production'}`}>
                        {isTestMode ? 'TEST' : 'LIVE'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button 
                  className="chatbot-action-btn" 
                  onClick={resetChat}
                  title="New Chat"
                  aria-label="New Chat"
                >
                  <RotateCcw size={16} />
                </button>
                {isModeToggleVisible && (
                  <button
                    className={`chatbot-action-btn mode-toggle ${isTestMode ? 'test' : 'production'}`}
                    onClick={toggleMode}
                    title={isTestMode ? 'Switch to Production' : 'Switch to Test Mode'}
                    aria-label={isTestMode ? 'Switch to Production' : 'Switch to Test Mode'}
                  >
                    {isTestMode ? <FlaskConical size={16} /> : <Radio size={16} />}
                  </button>
                )}
                <button 
                  className="chatbot-action-btn" 
                  onClick={() => setIsLarge(!isLarge)}
                  title={isLarge ? "Small view" : "Large view"}
                  aria-label={isLarge ? "Small view" : "Large view"}
                >
                  {isLarge ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button className="chatbot-action-btn close" onClick={() => setIsOpen(false)} title="Minimize chat" aria-label="Minimize chat">
                  <Minus size={18} />
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, index) => {
                const isBot = msg.type === 'bot';
                const isLastBotMsg = isBot && !messages.slice(index + 1).some(m => m.type === 'bot');

                return (
                  <div key={msg.id} className={`message-group message-group-${msg.type}`}>
                    <motion.div 
                      className={`message message-${msg.type}`}
                      initial={{ opacity: 0, x: msg.type === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {msg.type === 'bot' ? (
                        <>
                          {isHtmlContent(msg.content) ? (
                            <div
                              className="html-content"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(msg.content, {
                                  ADD_ATTR: ['target', 'rel', 'style', 'class', 'id', 'width', 'height', 'src', 'alt', 'href'],
                                  ADD_TAGS: ['style', 'svg', 'path', 'button']
                                })
                              }}
                            />
                          ) : (
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
                          )}
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

                    {/* AI Suggestions - Single Column List separate from the AI response box */}
                    {isBot && isLastBotMsg && msg.suggestions && msg.suggestions.length > 0 && (
                      <motion.div 
                        className="ai-suggestions-container"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.12 }}
                      >
                        <div className="ai-suggestions-header">
                          <Sparkles size={13} className="ai-suggestions-sparkle" />
                          <span>Suggested responses</span>
                        </div>
                        <div className="ai-suggestions-list">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <motion.button
                              key={sIdx}
                              className="ai-suggestion-btn"
                              onClick={() => handleSuggestionClick(suggestion)}
                              disabled={isLoading}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.18 + sIdx * 0.07, duration: 0.25 }}
                              whileHover={{ scale: 1.015, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="ai-suggestion-text">{suggestion}</span>
                              <span className="ai-suggestion-arrow" aria-hidden="true">
                                <ArrowRight size={14} />
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
              {!hasUserMessages && !isLoading && (
                <QuickActions onQuickAction={handleQuickAction} isLoading={isLoading} />
              )}
              {isLoading && (
                <div className="message-group message-group-bot">
                  <motion.div 
                    className="status-indicator-inline"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="status-icon-wrapper">
                      <Sparkles size={14} className="status-sparkle-icon" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={statusText || 'searching'}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.25 }}
                        className="status-stage-text"
                      >
                        {statusText || 'Searching database...'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
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
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="chatbot-footer-subtext">
                Neo can make mistakes. Verify travel details.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Minimize chat' : 'Open chat'}>
        {isOpen ? <Minus size={26} strokeWidth={2.5} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
};

export default ChatBot;

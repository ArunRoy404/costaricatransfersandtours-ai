import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const WEBHOOK_URL = 'https://costarica.app.n8n.cloud/webhook/maya-chat';

const ChatBot = ({ externalOpen, setExternalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      type: 'bot', 
      content: '¡Hola! I am Maya, your Costa Rica travel assistant. How can I help you plan your perfect trip today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [sessionId, setSessionId] = useState('');

  // Handle external trigger
  useEffect(() => {
    if (externalOpen) {
      setIsOpen(true);
      if (setExternalOpen) setExternalOpen(false);
    }
  }, [externalOpen, setExternalOpen]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Small delay to wait for animation
    }
  }, [isOpen]);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('chat_session_id');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
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

      const data = await response.text();
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data || "I'm sorry, I couldn't process that. Please try again."
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm having a bit of trouble connecting. Please check your internet or try again later!"
      }]);
    } finally {
      setIsLoading(false);
      // Refocus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Maya AI</h3>
                  <div className="chatbot-status">Online</div>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
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
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
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
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className="chatbot-send" 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatBot;

import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBot from './components/ChatBot';

// Ensure Google Fonts are loaded if not already present on the page
function ensureGoogleFonts() {
  const fontId = 'crtt-neo-google-fonts';
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

function NeoChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleTrigger = (e) => {
      e?.preventDefault?.();
      setIsOpen(true);
    };

    // Global JavaScript API for WordPress theme integration
    window.openNeoChatbot = () => setIsOpen(true);
    window.closeNeoChatbot = () => setIsOpen(false);
    window.toggleNeoChatbot = () => setIsOpen((prev) => !prev);

    // Support clicking on elements with class="open-neo-chat" or href="#open-neo-chat"
    const handleDocumentClick = (e) => {
      const target = e.target?.closest?.('a[href="#open-neo-chat"], .open-neo-chat, [data-open-neo-chat]');
      if (target) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('neo-chatbot-open', handleTrigger);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('neo-chatbot-open', handleTrigger);
    };
  }, []);

  return <ChatBot externalOpen={isOpen} setExternalOpen={setIsOpen} showModeToggle={false} />;
}

function initNeoChatbot() {
  if (typeof window === 'undefined') return;

  ensureGoogleFonts();

  const containerId = 'crtt-neo-chatbot-root';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<NeoChatbotWidget />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNeoChatbot);
} else {
  initNeoChatbot();
}

export default NeoChatbotWidget;

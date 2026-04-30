import React, { useEffect } from 'react';
import './App.css';
import heroImg from './assets/hero.png';

function App() {
  const toggleChat = () => {
    // 1. Try the programmatic API (window.Chatbot is the standard for n8n)
    if (window.Chatbot) {
      if (typeof window.Chatbot.open === 'function') {
        window.Chatbot.open();
        return;
      }
      if (typeof window.Chatbot.toggle === 'function') {
        window.Chatbot.toggle();
        return;
      }
    }

    // 2. Try the window.n8nChat fallback
    if (window.n8nChat && typeof window.n8nChat.open === 'function') {
      window.n8nChat.open();
      return;
    }

    // 3. Try to find the button in the main DOM
    let chatButton = document.querySelector('.n8n-chat-widget__toggle') || 
                     document.querySelector('.n8n-chat-widget-button') || 
                     document.querySelector('#n8n-chat-widget button');
    
    // 4. Try to find it inside Shadow DOM (common for n8n)
    if (!chatButton) {
      const chatContainer = document.querySelector('#n8n-chat-widget');
      if (chatContainer && chatContainer.shadowRoot) {
        chatButton = chatContainer.shadowRoot.querySelector('button');
      }
    }

    if (chatButton) {
      chatButton.click();
    } else {
      console.error('Could not find n8n chat widget or its toggle method.');
      // Final attempt: Just try to toggle any button in the widget container
      const fallbackContainer = document.querySelector('#n8n-chat-widget');
      if (fallbackContainer) {
        const anyButton = fallbackContainer.querySelector('button');
        if (anyButton) anyButton.click();
      }
    }
  };

  return (
    <div className="simple-app">
      <div className="background-overlay">
        <img src={heroImg} alt="Background" className="bg-image" />
      </div>
      
      <main className="content-wrapper animate-fade-in">
        <header className="brand-header">
          <h1>Guanacaste & Beyond</h1>
          <p className="tagline">Experiences Inspired By Natural Beauty</p>
        </header>

        <section className="story-section">
          <h2>Our Story</h2>
          <p>
            Established in Guanacaste, Costa Rica, Costa Rica Transfers & Tours have helped clients 
            plan airport transfers & guided sightseeing tours for over 18 years. Our commitment to 
            excellence ensures your every journey is seamless and stress-free. Our fleet of modern, 
            comfortable vehicles and a team of professional drivers, we prioritise your safety and convenience.
          </p>
          <p>
            Our exciting sightseeing experiences showcasing the best of Costa Rica enables you to 
            choose from our list of activities designed to highlight wondrous wildlife & waterfalls 
            to epic Volcanoes to coastal escapes.
          </p>
          <p className="emphasis">
            There's no better way to experience the magic of Costa Rica. Experience the difference 
            & plan your trip with us.
          </p>
        </section>

        <section className="services-list">
          <ul>
            <li>Transportation</li>
            <li>Experiences</li>
            <li>Boat Charters</li>
            <li>Private Dining</li>
          </ul>
        </section>

        <div className="cta-wrapper">
          <button className="chat-trigger-btn" onClick={toggleChat}>
            Plan Your Trip with Maya AI
          </button>
        </div>
      </main>

      <footer className="simple-footer">
        <p>&copy; 2026 Costa Rica Transfers & Tours</p>
      </footer>
    </div>
  );
}

export default App;

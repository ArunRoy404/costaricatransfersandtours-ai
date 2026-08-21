import { useState } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import ChatBot from './components/ChatBot';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="simple-app">
      <div className="background-overlay">
        <img src={heroImg} alt="Background" className="bg-image" />
      </div>
      
      <main className="content-wrapper animate-fade-in">
        <header className="brand-header">
          <p className="eyebrow">Costa Rica Transfers & Tours</p>
          <h1>Guanacaste & Beyond</h1>
          <p className="tagline">Experiences Inspired By Natural Beauty</p>
        </header>

        <section className="trust-strip" aria-label="Company highlights">
          <div>
            <span>18+</span>
            <p>Years planning seamless trips</p>
          </div>
          <div>
            <span>Private</span>
            <p>Transfers, tours, dining, charters</p>
          </div>
          <div>
            <span>Local</span>
            <p>Guanacaste-based travel team</p>
          </div>
        </section>

        <section className="story-section">
          <h2>Travel help that feels personal from the first message.</h2>
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
            <span>Plan Your Trip with Neo AI</span>
          </button>
        </div>
      </main>

      <footer className="simple-footer">
        <p>&copy; 2026 Costa Rica Transfers & Tours</p>
      </footer>
      <ChatBot externalOpen={isChatOpen} setExternalOpen={setIsChatOpen} showModeToggle={true} />
    </div>
  );
}

export default App;

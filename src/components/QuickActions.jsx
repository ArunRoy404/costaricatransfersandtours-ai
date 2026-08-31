import { motion } from 'framer-motion';
import './QuickActions.css';

const QUICK_ACTIONS = [
  {
    chatInput: 'Show me available travel packages and guided tours in Costa Rica.',
    buttonText: '✨ Explore Tours'
  },
  {
    chatInput: 'Show me private catamaran and boat charter options.',
    buttonText: '⛵ Boat Charters'
  },
  {
    chatInput: 'Show me exciting volcano trips and nature expeditions.',
    buttonText: '🌋 Volcano Trips'
  },
  {
    chatInput: 'Help me view my booking cart, checkout, and pricing details.',
    buttonText: '🛒 Cart & Booking'
  }
];

const QuickActions = ({ onQuickAction, isLoading }) => {
  return (
    <motion.div
      className="quick-actions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
    >
      <div className="quick-actions-hero">
        <h2 className="quick-actions-title">What can I help with?</h2>
        <p className="quick-actions-subtitle">
          Ask anything about tours, boat charters, or your booking cart.
        </p>
      </div>
      <div className="quick-actions-grid">
        {QUICK_ACTIONS.map((qa, index) => (
          <motion.button
            key={index}
            className="quick-action-btn"
            onClick={() => onQuickAction(qa.chatInput)}
            disabled={isLoading}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.25 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{qa.buttonText}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;

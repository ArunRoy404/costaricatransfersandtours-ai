import { motion } from 'framer-motion';
import './QuickActions.css';

const QUICK_ACTIONS = [
  {
    action: 'quickAction',
    chatInput: 'Show me how to get started with planning my next trip and using this site.',
    buttonText: '🚀 Get Started'
  },
  {
    action: 'quickAction',
    chatInput: 'Show me a quick tour of available travel packages and core website features.',
    buttonText: '✨ Take Tours'
  },
  {
    action: 'quickAction',
    chatInput: 'Show me the best beach tours, coastal destinations, and island getaways.',
    buttonText: '🏖️ Beach Tours'
  },
  {
    action: 'quickAction',
    chatInput: 'Show me available wildlife adventures, safaris, and nature expeditions.',
    buttonText: '🦁 Wildlife Adventures'
  },
  {
    action: 'quickAction',
    chatInput: 'Show me exciting volcano trips, hiking expeditions, and geothermal tours.',
    buttonText: '🌋 Volcano Trips'
  },
  {
    action: 'quickAction',
    chatInput: 'Help me book a trip right now by starting the reservation and checkout workflow.',
    buttonText: '📅 Book Now'
  }
];

const QuickActions = ({ onQuickAction, isLoading }) => {
  return (
    <motion.div
      className="quick-actions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <p className="quick-actions-label">Get started quickly:</p>
      <div className="quick-actions-grid">
        {QUICK_ACTIONS.map((qa, index) => (
          <motion.button
            key={index}
            className="quick-action-btn"
            onClick={() => onQuickAction(qa.chatInput)}
            disabled={isLoading}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.06, duration: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {qa.buttonText}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Crown, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../translations';
import './ChatPage.css';

const ChatPage = ({ language, isDarkMode, user }) => {
  // Debug user data
  console.log('=== CHATPAGE DEBUG ===');
  console.log('User prop:', user);
  console.log('localStorage userData:', localStorage.getItem('userData'));
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const t = translations[language];
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: user?.isPremium 
          ? (language === 'en' 
            ? "Welcome premium member! I'm your AI fortune teller. Ask me anything about your future."
            : "ပရီမီယံအဖွဲ့ဝင် ကြိုဆိုပါတယ်! ကျွန်တော်က သင်၏ AI ဗေဒင်ဆရာပါ။ သင်၏အနာဂတ်အကြောင်း မေးမြန်းပါ။")
          : (language === 'en' 
            ? "Welcome! I'm your AI fortune teller. Ask me about your future, but remember - for detailed predictions, you'll need a premium subscription."
            : "ကြိုဆိုပါတယ်! ကျွန်တော်က သင်၏ AI ဗေဒင်ဆရာပါ။ သင်၏အနာဂတ်အကြောင်း မေးမြန်းပါ၊ သို့သော် အသေးစိတ်ဟောစာများအတွက် ပရီမီယံ စာရင်းသွင်းမှု လိုအပ်ကြောင်း မှတ်သားပါ။"),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className={`chat-page ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="chat-container">
          <div className="auth-required">
            <h2>{language === 'en' ? 'Login Required' : 'အကောင့်ဝင်ရန် လိုအပ်သည်'}</h2>
            <p>{language === 'en' ? 'Please login to access the chat feature.' : 'ချတ်ဝန်ဆောင်မှုကို အသုံးပြုရန် အကောင့်ဝင်ပါ။'}</p>
            <Link to="/auth" className="login-link">
              {language === 'en' ? 'Login / Register' : 'အကောင့်ဝင်ရန် / စာရင်းသွင်းရန်'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const specialTopics = ['name', 'naming', 'ritual', 'magic', 'နာမည်', 'မှော်', 'ကမ္မဌာန်း'];
      const containsSpecialTopic = specialTopics.some(topic => 
        inputMessage.toLowerCase().includes(topic.toLowerCase())
      );

      if (containsSpecialTopic) {
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: t.specialTopicsNote,
            timestamp: new Date(),
            isSpecial: true
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 1500);
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          language,
          isPremium,
          userId: user?.id,
          userName: user?.name // Send user name for verification
        })
      });

      const data = await response.json();

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response || (isPremium ? 
            "I sense great things in your future. The stars align favorably for you." :
            "I can see glimpses of your future, but for detailed insights, consider upgrading to premium."
          ),
          timestamp: new Date(),
          isPremiumRequired: !isPremium && data.premiumRequired
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: t.error,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <h1>{t.chatTitle}</h1>
            <p>{t.chatSubtitle}</p>
          </div>
          {!isPremium && (
            <Link to="/payment" className="premium-badge">
              <Crown size={16} />
              {t.upgradeToPremium}
            </Link>
          )}
          {isPremium && (
            <div className="premium-badge active">
              <Crown size={16} />
              Premium Member
            </div>
          )}
        </div>

        <div className="messages-container">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`message ${message.type}`}
              >
                <div className="message-avatar">
                  {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="message-content">
                  <div className={`message-bubble ${message.isError ? 'error' : ''} ${message.isSpecial ? 'special' : ''}`}>
                    {message.content}
                    {message.isPremiumRequired && (
                      <div className="premium-prompt">
                        <p>{t.premiumRequired}</p>
                        <Link to="/payment" className="upgrade-link">
                          <Crown size={14} />
                          {t.upgradeToPremium}
                        </Link>
                      </div>
                    )}
                    {message.isSpecial && (
                      <div className="booking-prompt">
                        <Link to="/booking" className="booking-link">
                          <Calendar size={14} />
                          {t.booking}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message bot"
            >
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.typeMessage}
              rows="1"
              className="message-input"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

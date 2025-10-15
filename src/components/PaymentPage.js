import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Star, CreditCard } from 'lucide-react';
import { translations } from '../translations';
import UserAuth from './UserAuth';
import './PaymentPage.css';

const PaymentPage = ({ language, isDarkMode, user: propUser, onLogout }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedPayment, setSelectedPayment] = useState('kbzpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(propUser);
  const [showAuth, setShowAuth] = useState(false);

  const t = translations[language];

  useEffect(() => {
    // Use prop user or check localStorage
    if (propUser) {
      setUser(propUser);
    } else {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [propUser]);

  const plans = [
    {
      id: 'monthly',
      title: t.pricingPlans.monthly.title,
      price: t.pricingPlans.monthly.price,
      duration: t.pricingPlans.monthly.duration,
      popular: false
    },
    {
      id: 'yearly',
      title: t.pricingPlans.yearly.title,
      price: t.pricingPlans.yearly.price,
      duration: t.pricingPlans.yearly.duration,
      savings: t.pricingPlans.yearly.savings,
      popular: true
    }
  ];

  const paymentMethods = [
    {
      id: 'kbzpay',
      name: 'KBZ Pay',
      icon: '💳',
      color: '#1e40af'
    },
    {
      id: 'wavepay',
      name: 'Wave Pay',
      icon: '📱',
      color: '#059669'
    },
    {
      id: 'ayapay',
      name: 'AYA Pay',
      icon: '💰',
      color: '#dc2626'
    }
  ];

  const premiumFeatures = t.premiumFeatures.features;

  const handleSubscribe = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: selectedPayment,
          userId: user.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user premium status
        const updatedUser = { ...user, isPremium: true };
        setUser(updatedUser);
        localStorage.setItem('userToken', JSON.stringify(updatedUser));
        setShowSuccess(true);
      } else {
        alert('Payment failed: ' + data.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  if (showSuccess) {
    return (
      <div className={`payment-page ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="payment-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-card"
          >
            <div className="success-icon">
              <Crown size={64} />
            </div>
            <h2>Welcome to Premium!</h2>
            <p>Your subscription has been activated successfully.</p>
            <div className="success-features">
              <h3>You now have access to:</h3>
              <ul>
                {premiumFeatures.map((feature, index) => (
                  <li key={index}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              className="continue-button"
              onClick={() => window.location.href = '/chat'}
            >
              Start Chatting
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="payment-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="payment-header"
        >
          <Crown className="header-icon" size={48} />
          <h1>{t.paymentTitle}</h1>
          <p>{t.paymentSubtitle}</p>
          {user && (
            <div className="user-info">
              <p>Logged in as: <strong>{user.name}</strong></p>
              {onLogout && (
                <button onClick={onLogout} className="logout-btn">
                  {language === 'en' ? 'Logout' : 'ထွက်ရန်'}
                </button>
              )}
            </div>
          )}
              {user.isPremium && (
                <div className="premium-status">
                  <Crown size={16} />
                  <span>Premium Member</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {user?.isPremium ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="already-premium"
          >
            <Crown size={48} className="premium-icon" />
            <h2>You're already a Premium member!</h2>
            <p>Enjoy unlimited access to all premium features.</p>
            <button 
              className="continue-button"
              onClick={() => window.location.href = '/chat'}
            >
              Go to Chat
            </button>
          </motion.div>
        ) : (
          <>
            <div className="payment-content">
              {/* Premium Features */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="features-section"
              >
                <h3>{t.premiumFeatures.title}</h3>
                <div className="features-list">
                  {premiumFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="feature-item"
                    >
                      <Star size={16} className="feature-icon" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Pricing Plans */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="pricing-section"
              >
                <h3>Choose Your Plan</h3>
                <div className="pricing-plans">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`pricing-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && <div className="popular-badge">Most Popular</div>}
                      <h4>{plan.title}</h4>
                      <div className="price">
                        <span className="amount">{plan.price}</span>
                        <span className="duration">{plan.duration}</span>
                      </div>
                      {plan.savings && (
                        <div className="savings">{plan.savings}</div>
                      )}
                      <div className="plan-selector">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={selectedPlan === plan.id}
                          onChange={() => setSelectedPlan(plan.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="payment-methods"
            >
              <h3>{t.paymentMethods.title}</h3>
              <div className="payment-options">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="payment-icon" style={{ color: method.color }}>
                      {method.icon}
                    </div>
                    <span>{method.name}</span>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Subscribe Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="subscribe-section"
            >
              <button
                className="subscribe-button"
                onClick={handleSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="processing">
                    <div className="spinner"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Crown size={20} />
                    {user ? t.subscribe : 'Login & Subscribe'}
                  </>
                )}
              </button>
              
              <div className="payment-security">
                <CreditCard size={16} />
                <span>Secure payment powered by Myanmar Payment Gateway</span>
              </div>

              {!user && (
                <div className="login-prompt">
                  <p>Need an account? 
                    <button 
                      className="login-link"
                      onClick={() => setShowAuth(true)}
                    >
                      Login or Sign up
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* User Authentication Modal */}
      {showAuth && (
        <UserAuth
          onLogin={handleLogin}
          language={language}
          isDarkMode={isDarkMode}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
};

export default PaymentPage;

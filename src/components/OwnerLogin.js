import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, User, Lock, Eye, EyeOff } from 'lucide-react';
import './OwnerLogin.css';

const OwnerLogin = ({ onLogin, language, isDarkMode }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Owner login attempt:', { email: credentials.email, password: '***' });

    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        // Store both token and user data
        localStorage.setItem('ownerToken', data.token);
        localStorage.setItem('ownerData', JSON.stringify(data.user));
        
        console.log('Owner login successful, calling onLogin callback');
        onLogin(data.user);
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/owner-dashboard');
        }, 100);
      } else {
        console.error('Login failed:', data.message);
        setError(data.message || 'Invalid owner credentials');
      }
    } catch (error) {
      console.error('Owner login error:', error);
      setError(`Login failed: ${error.message}. Make sure the server is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`owner-login ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="login-card"
        >
          <div className="login-header">
            <Crown className="login-icon" size={48} />
            <h2>Owner Dashboard Access</h2>
            <p>Please login with your owner credentials</p>
          </div>

          <div className="owner-credentials-hint">
            <p><strong>Owner Email:</strong> naingwin@owner.com</p>
            <p><strong>Password:</strong> naingwinohnmarmyint29A</p>
            <button 
              type="button" 
              className="auto-fill-button"
              onClick={() => setCredentials({
                email: 'naingwin@owner.com',
                password: 'naingwinohnmarmyint29A'
              })}
            >
              Auto-Fill Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Owner Email</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="naingwin@owner.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Owner Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter owner password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              className="login-button"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  Logging in...
                </div>
              ) : (
                <>
                  <Crown size={20} />
                  Access Dashboard
                </>
              )}
            </motion.button>
          </form>

          <div className="login-footer">
            <p>Authorized owner access only</p>
            <p>This is separate from regular user accounts</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerLogin;

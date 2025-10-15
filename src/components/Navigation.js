import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageCircle, Crown, Settings } from 'lucide-react';
import { translations } from '../translations';
import './Navigation.css';

const Navigation = ({ language, toggleLanguage, isDarkMode, setIsDarkMode, user, onLogout }) => {
  const location = useLocation();
  const t = translations[language];

  const navItems = [
    { path: '/', icon: Home, label: t.home },
    { path: '/booking', icon: Calendar, label: t.booking },
    { path: '/chat', icon: MessageCircle, label: t.chat },
    { path: '/payment', icon: Crown, label: t.payment }
  ];

  // Show owner dashboard if user is owner
  if (user?.isOwner) {
    navItems.push({ path: '/owner-dashboard', icon: Settings, label: t.ownerDashboard });
  }

  return (
    <nav className={`navigation ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🔮 Sayar Naing Win</h2>
        </div>
        
        <div className="nav-links">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-controls">
          {user ? (
            <div className="user-info">
              <span className="user-name">
                {user.name} {user.isPremium && '👑'}
              </span>
              <button onClick={onLogout} className="logout-btn">
                {language === 'en' ? 'Logout' : 'ထွက်ရန်'}
              </button>
            </div>
          ) : (
            <Link to="/auth" className="login-btn">
              {language === 'en' ? 'Login' : 'အကောင့်ဝင်ရန်'}
            </Link>
          )}
          
          <button className="lang-switcher" onClick={toggleLanguage}>
            {t.languageButton}
          </button>
          <div className="dark-mode-toggle">
            <label>{t.darkMode}</label>
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={() => setIsDarkMode(!isDarkMode)} 
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

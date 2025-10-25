import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Background from './Background';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import BookingPage from './components/BookingPage';
import ChatPage from './components/ChatPage';
import OwnerDashboard from './components/OwnerDashboard';
import OwnerLogin from './components/OwnerLogin';
import PaymentPage from './components/PaymentPage';
import UserAuth from './components/UserAuth';

function App() {
  const [language, setLanguage] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
    
    // Check if user OR owner is logged in
    const checkUser = () => {
      // First check for owner data
      const ownerData = localStorage.getItem('ownerData');
      if (ownerData && ownerData !== 'undefined') {
        try {
          const parsedOwner = JSON.parse(ownerData);
          console.log('=== OWNER LOGGED IN ===');
          console.log('Owner data:', parsedOwner);
          if (parsedOwner && parsedOwner.id) {
            setUser(parsedOwner);
            return;
          }
        } catch (error) {
          console.log('Error parsing owner data:', error);
          localStorage.removeItem('ownerData');
          localStorage.removeItem('ownerToken');
        }
      }
      
      // Then check for regular user data
      const userData = localStorage.getItem('userData');
      console.log('=== APP.JS USER CHECK ===');
      console.log('localStorage userData:', userData);
      
      if (userData && userData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user:', parsedUser);
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
          } else {
            console.log('Invalid user data, clearing...');
            localStorage.removeItem('userData');
            setUser(null);
          }
        } catch (error) {
          console.log('Error parsing user data:', error);
          localStorage.removeItem('userData');
          setUser(null);
        }
      } else {
        console.log('No valid user data in localStorage');
        setUser(null);
      }
    };

    checkUser();
    
    // Also check on storage changes
    const handleStorageChange = () => {
      checkUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDarkMode]);

  const handleLogin = (userData) => {
    console.log('=== APP.JS LOGIN ===');
    console.log('Login data received:', userData);
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('User state updated and saved to localStorage');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('ownerData');
    localStorage.removeItem('ownerToken');
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'my' : 'en'));
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Background />
        <Navigation 
          language={language}
          toggleLanguage={toggleLanguage}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          user={user}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={
            <HomePage 
              language={language}
              isDarkMode={isDarkMode}
            />
          } />
          <Route path="/auth" element={
            <UserAuth 
              language={language}
              isDarkMode={isDarkMode}
              onLogin={handleLogin}
            />
          } />
          <Route path="/booking" element={
            <BookingPage 
              language={language}
              isDarkMode={isDarkMode}
            />
          } />
          <Route path="/chat" element={
            <ChatPage 
              language={language}
              isDarkMode={isDarkMode}
              user={user}
            />
          } />
          <Route path="/payment" element={
            <PaymentPage 
              language={language}
              isDarkMode={isDarkMode}
              user={user}
              onLogout={handleLogout}
            />
          } />
          <Route path="/owner-login" element={
            <OwnerLogin 
              language={language}
              isDarkMode={isDarkMode}
              onLogin={handleLogin}
            />
          } />
          <Route path="/owner-dashboard" element={
            user?.isOwner ? (
              <OwnerDashboard 
                language={language}
                isDarkMode={isDarkMode}
                user={user}
              />
            ) : (
              <Navigate to="/owner-login" replace />
            )
          } />
          <Route path="*" element={
            <HomePage 
              language={language}
              isDarkMode={isDarkMode}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


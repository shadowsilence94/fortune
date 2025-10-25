import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Settings, 
  Users, 
  Clock,
  TrendingUp,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { translations } from '../translations';
import './OwnerDashboard.css';

const OwnerDashboard = ({ language, isDarkMode, user }) => {
  const navigate = useNavigate();
  const [ownerToken, setOwnerToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [authError, setAuthError] = useState(false);

  // translations is used in the component, keeping it for future use
  // eslint-disable-next-line no-unused-vars
  const t = translations[language];

  useEffect(() => {
    console.log('=== OWNER DASHBOARD MOUNTED ===');
    console.log('User prop:', user);
    
    if (!user || !user.isOwner) {
      console.log('User is not owner, redirecting to login...');
      setAuthError(true);
      setTimeout(() => {
        navigate('/owner-login');
      }, 2000);
      return;
    }
    
    const token = localStorage.getItem('ownerToken');
    console.log('Owner token from localStorage:', token);
    
    if (token) {
      setOwnerToken(token);
      fetchDashboardData(token);
    } else {
      console.log('No owner token found');
      setAuthError(true);
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (token) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!ownerToken) return;
    
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': ownerToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (!user?.isOwner) {
    return (
      <div className={`dashboard-page ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="owner-login-container">
          <div className="auth-required">
            <h2>Owner Access Required</h2>
            <p>Please login with owner credentials to access the dashboard.</p>
            <Link to="/auth" className="login-link">
              Login as Owner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'chats', label: 'Chat Sessions', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'users') {
      fetchUsers();
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(ownerToken);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`dashboard-page ${isDarkMode ? 'dark' : 'light'}`}>
      {authError ? (
        <div className="dashboard-container">
          <div className="auth-error">
            <XCircle size={48} className="error-icon" />
            <h2>Authentication Failed</h2>
            <p>Please login with owner credentials to access the dashboard.</p>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      ) : (
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Owner Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="header-right">
            <div className="current-time">
              <Clock size={16} />
              {currentTime.toLocaleString()}
            </div>
            <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <Calendar className="stat-icon" />
                  <div className="stat-info">
                    <h3>Today's Bookings</h3>
                    <p className="stat-number">{dashboardData?.todayBookings || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <MessageSquare className="stat-icon" />
                  <div className="stat-info">
                    <h3>Active Chats</h3>
                    <p className="stat-number">{dashboardData?.activeChats || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <DollarSign className="stat-icon" />
                  <div className="stat-info">
                    <h3>Monthly Revenue</h3>
                    <p className="stat-number">{formatCurrency(dashboardData?.monthlyRevenue || 0)}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <Users className="stat-icon" />
                  <div className="stat-info">
                    <h3>Premium Users</h3>
                    <p className="stat-number">{dashboardData?.premiumUsers || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-content">
              <h2>User Management</h2>
              <div className="users-list">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <span className={`status ${user.isPremium ? 'premium' : 'regular'}`}>
                        {user.isPremium ? 'Premium' : 'Regular'}
                      </span>
                    </div>
                    <div className="user-actions">
                      <button 
                        onClick={() => toggleUserPremium(user.id, !user.isPremium)}
                        className={`toggle-btn ${user.isPremium ? 'remove' : 'add'}`}
                      >
                        {user.isPremium ? 'Remove Premium' : 'Make Premium'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-content">
              <h2>Recent Bookings</h2>
              <div className="bookings-list">
                {dashboardData?.bookings?.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-info">
                      <h4>{booking.name}</h4>
                      <p>{booking.email}</p>
                      <p>{booking.phone}</p>
                      <span className="booking-time">{formatTime(booking.createdAt)}</span>
                    </div>
                    <div className="booking-status">
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chats' && (
            <div className="chats-content">
              <h2>Recent Chat Sessions</h2>
              <div className="chats-list">
                {dashboardData?.chatSessions?.map(chat => (
                  <div key={chat.id} className="chat-card">
                    <div className="chat-info">
                      <h4>User: {chat.userId}</h4>
                      <p className="chat-message">{chat.message}</p>
                      <p className="chat-response">{chat.response}</p>
                      <span className="chat-time">{formatTime(chat.timestamp)}</span>
                    </div>
                    <div className="chat-status">
                      <span className={`status ${chat.isPremium ? 'premium' : 'regular'}`}>
                        {chat.isPremium ? 'Premium' : 'Regular'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const toggleUserPremium = async (userId, isPremium) => {
  try {
    const response = await fetch('/api/admin/approve-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('ownerToken')
      },
      body: JSON.stringify({ userId, isPremium })
    });
    
    if (response.ok) {
      window.location.reload(); // Simple refresh for now
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

export default OwnerDashboard;

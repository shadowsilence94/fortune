import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles, Calendar, MessageCircle, Printer } from 'lucide-react';
import { translations } from '../translations';
import './HomePage.css';

const HomePage = ({ language, isDarkMode }) => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [userGender, setUserGender] = useState('male');
  const [specificQuestion, setSpecificQuestion] = useState('');
  const [topic, setTopic] = useState('Love');
  const [timeline, setTimeline] = useState('1 Year');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[language];

  const getPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction('');

    try {
      console.log('Sending prediction request...');
      
      const response = await fetch('/api/horoscope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
          userGender,
          topic,
          specificQuestion,
          timeline,
          language
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || t.error);
        setPrediction(data.prediction || '');
      }
    } catch (e) {
      console.error("Error fetching prediction:", e);
      setError(`${t.error} (Details: ${e.message})`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!prediction) {
      alert('No prediction to print!');
      return;
    }

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fortune Reading - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #8b0000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #8b0000;
              font-size: 2rem;
              margin: 0;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
            }
            .details {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .details h3 {
              color: #8b0000;
              margin-top: 0;
            }
            .detail-item {
              margin: 10px 0;
            }
            .prediction {
              background: white;
              padding: 30px;
              border: 2px solid #8b0000;
              border-radius: 10px;
              font-size: 1.1rem;
              line-height: 1.8;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              color: #666;
              font-size: 0.9rem;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔮 Sayar Naing Win Fortune Reading</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="details">
            <h3>Reading Details</h3>
            <div class="detail-item"><strong>Birth Date:</strong> ${birthDate}</div>
            <div class="detail-item"><strong>Birth Time:</strong> ${birthTime}</div>
            <div class="detail-item"><strong>Birth Place:</strong> ${birthPlace}</div>
            <div class="detail-item"><strong>Gender:</strong> ${userGender}</div>
            <div class="detail-item"><strong>Topic:</strong> ${topic}</div>
            <div class="detail-item"><strong>Timeline:</strong> ${timeline}</div>
            ${specificQuestion ? `<div class="detail-item"><strong>Specific Question:</strong> ${specificQuestion}</div>` : ''}
          </div>
          
          <div class="prediction">
            <h3 style="color: #8b0000; margin-top: 0;">Your Fortune Reading</h3>
            ${prediction.replace(/\n/g, '<br>')}
          </div>
          
          <div class="footer">
            <p>This reading is for entertainment purposes only.</p>
            <p>© Sayar Naing Win Fortune Telling App</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const features = [
    {
      icon: Star,
      title: t.features.horoscope.title,
      description: t.features.horoscope.description,
      link: '#fortune-form'
    },
    {
      icon: MessageCircle,
      title: t.features.chat.title,
      description: t.features.chat.description,
      link: '/chat'
    },
    {
      icon: Calendar,
      title: t.features.booking.title,
      description: t.features.booking.description,
      link: '/booking'
    }
  ];

  return (
    <div className={`homepage ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              <Sparkles className="title-icon" />
              {t.welcomeTitle}
              <Sparkles className="title-icon" />
            </h1>
            <p className="hero-subtitle">{t.welcomeSubtitle}</p>
            <a href="#fortune-form" className="cta-button">
              {t.getStarted}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="feature-card"
            >
              <feature.icon className="feature-icon" size={48} />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.link.startsWith('/') ? (
                <Link to={feature.link} className="feature-link">
                  Learn More →
                </Link>
              ) : (
                <a href={feature.link} className="feature-link">
                  Learn More →
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fortune Form Section */}
      <section id="fortune-form" className="fortune-section">
        <div className="fortune-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fortune-form"
          >
            <h2 className="section-title">{t.title}</h2>
            
            <div className="input-grid">
              <div className="input-group">
                <label>{t.birthDate}</label>
                <input 
                  type="date" 
                  value={birthDate} 
                  onChange={e => setBirthDate(e.target.value)} 
                />
              </div>
              
              <div className="input-group">
                <label>{t.birthTime}</label>
                <input 
                  type="time" 
                  value={birthTime} 
                  onChange={e => setBirthTime(e.target.value)} 
                />
              </div>
              
              <div className="input-group">
                <label>{t.birthPlace}</label>
                <input 
                  type="text" 
                  value={birthPlace} 
                  onChange={e => setBirthPlace(e.target.value)} 
                  placeholder="e.g., Yangon, Myanmar" 
                />
              </div>
              
              <div className="input-group">
                <label>{t.userGender}</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      value="male" 
                      checked={userGender === 'male'} 
                      onChange={e => setUserGender(e.target.value)} 
                    />
                    {t.male}
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      value="female" 
                      checked={userGender === 'female'} 
                      onChange={e => setUserGender(e.target.value)} 
                    />
                    {t.female}
                  </label>
                </div>
              </div>
              
              <div className="input-group">
                <label>{t.topic}</label>
                <select value={topic} onChange={e => setTopic(e.target.value)}>
                  {translations.en.topics.map((enTopic, i) => (
                    <option key={enTopic} value={enTopic}>{t.topics[i]}</option>
                  ))}
                </select>
              </div>
              
              <div className="input-group">
                <label>{t.timeline}</label>
                <select value={timeline} onChange={e => setTimeline(e.target.value)}>
                  {translations.en.timelines.map((enTimeline, i) => (
                    <option key={enTimeline} value={enTimeline}>{t.timelines[i]}</option>
                  ))}
                </select>
              </div>
              
              <div className="input-group full-width">
                <label>{t.specificQuestion}</label>
                <textarea 
                  value={specificQuestion} 
                  onChange={e => setSpecificQuestion(e.target.value)} 
                  placeholder="Ask a specific question..." 
                />
              </div>
            </div>

            <motion.button 
              className="fortune-button" 
              onClick={getPrediction} 
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? t.loadingText : t.buttonText}
            </motion.button>

            {/* Results Section */}
            <div className="results-container">
              <div className="fortune-card">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p className="loading-text">{t.loadingText}</p>
                  </div>
                ) : error ? (
                  <p className="error-text">{error}</p>
                ) : prediction ? (
                  <div className="prediction-result">
                    <p className="fortune-text">{prediction}</p>
                    <div className="result-actions">
                      <motion.button
                        className="print-button"
                        onClick={handlePrint}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Printer size={20} />
                        Print Reading
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="fortune-text">{t.placeholder}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

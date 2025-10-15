import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, MessageSquare, CheckCircle } from 'lucide-react';
import { translations } from '../translations';
import './BookingPage.css';

const BookingPage = ({ language, isDarkMode }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    consultationType: 'general',
    fullName: '',
    phoneNumber: '',
    email: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[language];

  const consultationTypes = [
    { value: 'general', label: t.consultationTypes.general, price: '50,000 MMK' },
    { value: 'love', label: t.consultationTypes.love, price: '60,000 MMK' },
    { value: 'career', label: t.consultationTypes.career, price: '60,000 MMK' },
    { value: 'health', label: t.consultationTypes.health, price: '55,000 MMK' },
    { value: 'naming', label: t.consultationTypes.naming, price: '80,000 MMK' },
    { value: 'ritual', label: t.consultationTypes.ritual, price: '100,000 MMK' }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Booking data:', formData);
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isSuccess) {
    return (
      <div className={`booking-page ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="booking-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-message"
          >
            <CheckCircle size={64} className="success-icon" />
            <h2>{t.bookingSuccess}</h2>
            <p>We will contact you soon to confirm your appointment.</p>
            <button 
              className="back-button"
              onClick={() => setIsSuccess(false)}
            >
              Book Another Appointment
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`booking-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="booking-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="booking-header"
        >
          <h1>{t.bookingTitle}</h1>
          <p>{t.bookingSubtitle}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="booking-form"
        >
          {/* Date and Time Selection */}
          <div className="form-section">
            <h3><Calendar size={20} /> Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t.selectDate}</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.selectTime}</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="form-section">
            <h3><MessageSquare size={20} /> {t.consultationType}</h3>
            <div className="consultation-types">
              {consultationTypes.map(type => (
                <label key={type.value} className="consultation-option">
                  <input
                    type="radio"
                    name="consultationType"
                    value={type.value}
                    checked={formData.consultationType === type.value}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">{type.label}</span>
                    <span className="option-price">{type.price}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3><User size={20} /> {t.contactInfo}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t.fullName}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.phoneNumber}</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>{t.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-section">
            <div className="form-group">
              <label>{t.additionalNotes}</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any specific questions or requirements..."
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? t.loading : t.bookAppointment}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default BookingPage;

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getCountries } from '../utils/locationData';
import "./basic-info-style.css";

export default function BasicInfoPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    country: user?.country || ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If not logged in, redirect declaratively (avoids side-effects in render)
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!form.firstName.trim()) {
        setError('First name is required.');
        setIsLoading(false);
        return;
      }

      if (!form.lastName.trim()) {
        setError('Last name is required.');
        setIsLoading(false);
        return;
      }

      if (!form.country) {
        setError('Country is required.');
        setIsLoading(false);
        return;
      }

      // Update user with basic info
      const updatedUser = {
        ...user,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        country: form.country,
        location: form.country // Set initial location as country
      };

      setUser(updatedUser);

      // Navigate to next onboarding step
      navigate('/onboarding/focus-areas');
      
    } catch (err) {
      setError('Failed to save information. Please try again.');
    }
    
    setIsLoading(false);
  }

  const handleBack = () => {
    navigate('/signup');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleConnections = () => {
    navigate('/connections');
  };

  const handleFriends = () => {
    navigate('/friends');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleProfile = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <div className="basic-info-page">
      <nav className="basic-info-nav">
        <button 
          className="nav-button"
          onClick={handleHome}
          type="button"
        >
          HOME
        </button>
        <button 
          className="nav-button"
          onClick={handleConnections}
          type="button"
        >
          CONNECTIONS
        </button>
        <button 
          className="nav-button"
          onClick={handleFriends}
          type="button"
        >
          FRIENDS
        </button>
        <button 
          className="nav-button"
          onClick={handleSettings}
          type="button"
        >
          SETTINGS
        </button>
        <button 
          className="nav-icon"
          onClick={handleNotifications}
          type="button"
          aria-label="Notifications"
        >
          🔔
        </button>
        <button 
          className="nav-avatar"
          onClick={handleProfile}
          type="button"
          aria-label="Profile"
        >
          {user?.firstName?.charAt(0) || user?.username?.charAt(0) || '?'}
        </button>
      </nav>

      <div className="basic-info-container">
        <div className="basic-info-card">
          <h1 className="basic-info-title">BASIC INFO</h1>
          
          <form onSubmit={handleSubmit} className="basic-info-form">
            <div className="form-field">
              <label className="field-label">first name*</label>
              <input
                type="text"
                className="field-input"
                value={form.firstName}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder=""
              />
            </div>

            <div className="form-field">
              <label className="field-label">last name*</label>
              <input
                type="text"
                className="field-input"
                value={form.lastName}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder=""
              />
            </div>

            <div className="form-field">
              <label className="field-label">country*</label>
              <select
                className="field-input"
                value={form.country}
                onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
                required
                disabled={isLoading}
              >
                <option value=""></option>
                {getCountries().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="action-button back-button"
                onClick={handleBack}
                disabled={isLoading}
              >
                back
              </button>
              <button
                type="submit"
                className="action-button next-button"
                disabled={isLoading}
              >
                {isLoading ? 'saving...' : 'next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

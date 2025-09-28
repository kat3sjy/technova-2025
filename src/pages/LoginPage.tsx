import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import "./home-style.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to profile
  if (user) {
    navigate(`/profile/${user.username}`);
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const enteredUsername = form.username.trim().toLowerCase();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: enteredUsername, password: form.password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Invalid username or password.');
      }
      const userDoc = await res.json();
      setUser({
        id: userDoc._id,
        username: userDoc.username,
        firstName: userDoc.firstName || '',
        lastName: userDoc.lastName || '',
        areas: userDoc.tags || [],
        goals: userDoc.goals || '',
        experienceLevel: userDoc.experienceLevel || '',
        bio: userDoc.bio || '',
        location: userDoc.location || '',
        createdAt: userDoc.createdAt || new Date().toISOString()
      });
      navigate('/explore');
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = async () => {
    // Use existing login logic
    const event = { preventDefault: () => {} } as React.FormEvent;
    await handleLogin(event);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleConnections = () => {
    navigate('/explore');
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
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="home-page">
      {/* Auth Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Sign In
          </h1>
          <p className="hero-description">
            Welcome back to Ctrl+Femme! Sign in to connect with your community and continue building meaningful relationships.
          </p>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username*</label>
              <input
                type="text"
                className="form-input"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password*</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
                disabled={isLoading}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <Link to="/" className="hero-btn secondary">
                Back to Home
              </Link>
              <button 
                type="submit"
                className="hero-btn primary"
                disabled={isLoading || !form.username.trim() || !form.password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="auth-switch">
              <p>Don't have an account? <Link to="/signup" className="auth-link">Create one here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
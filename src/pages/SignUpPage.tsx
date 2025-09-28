import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { validatePassword } from '../utils/password';
import "./home-style.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { users, registerUser } = useUserStore() as any;
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!form.username.trim()) {
        setError('Username is required.');
        setIsLoading(false);
        return;
      }

      if (!form.password) {
        setError('Password is required.');
        setIsLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      // Validate password strength
      const passwordIssues = validatePassword(form.password);
      if (passwordIssues.length > 0) {
        setError(`Password requirements: ${passwordIssues.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Create account via backend
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.trim().toLowerCase(), password: form.password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create account');
      }
      const userDoc = await res.json();
      // Minimal store set; onboarding will complete profile
      registerUser({
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
      // Go to onboarding to fill remaining fields
      navigate('/onboarding');
      
    } catch (err) {
      setError('Sign up failed. Please try again.');
    }
    
    setIsLoading(false);
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = async () => {
    const event = { preventDefault: () => {} } as React.FormEvent;
    await handleSignUp(event);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="home-page">
      {/* Auth Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Join Ctrl+Femme
          </h1>
          <p className="hero-description">
            Create your account and join a community built by diversity. Connect with others who share your passions in gaming, tech, and sports.
          </p>
          
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username*</label>
              <input
                type="text"
                className="form-input"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="Choose a username"
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
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password*</label>
              <input
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="Confirm your password"
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
                disabled={isLoading || !form.username.trim() || !form.password || !form.confirmPassword}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="auth-switch">
              <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
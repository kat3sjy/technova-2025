import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './home-style.css';

const EXPERIENCE_LEVELS = ['Student', 'Newbie', 'Amateur', 'Intermediate', 'Pro'];

export default function ExperienceGoalsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || '');
  const [goals, setGoals] = useState(user?.goals || '');
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/signup" replace />;
  if (!user || !user.firstName || !user.lastName || !user.country) return <Navigate to="/signup" replace />;
  if (!user.areas?.length) return <Navigate to="/onboarding/focus-areas" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!experienceLevel || !goals.trim()) { setError('Please fill out both fields.'); return; }
    setUser({ ...user, experienceLevel, goals: goals.trim() });
    navigate('/onboarding/bio-picture');
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Experience & Goals</h1>
          <p className="hero-description">Share where you are now and what you want out of this community.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Experience Level*</label>
              <select className="form-input" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} required>
                <option value="">Select...</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Goals*</label>
              <textarea className="form-input" rows={4} value={goals} onChange={e => setGoals(e.target.value)} placeholder="What do you hope to achieve?" required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="button" className="hero-btn" onClick={() => navigate('/onboarding/focus-areas')}>Back</button>
              <button type="submit" className="hero-btn primary" disabled={!experienceLevel || !goals.trim()}>Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

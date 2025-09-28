import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './home-style.css';

const AREA_OPTIONS = ['Gaming', 'Esports', 'Game Dev', 'Tech Conventions', 'Sports Analytics', 'Sports Performance', 'VR/AR', 'Web Dev'];

export default function FocusAreasPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;
  const [areas, setAreas] = useState<string[]>(user?.areas || []);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/signup" replace />;
  if (!user || !user.firstName || !user.lastName || !user.country) return <Navigate to="/signup" replace />;

  function toggle(area: string) {
    setAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!areas.length) { setError('Select at least one focus area.'); return; }
    setUser({ ...user, areas });
    navigate('/onboarding/experience-goals');
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your Focus Areas</h1>
          <p className="hero-description">Pick the topics you want to connect around. You can change these later.</p>
          <form onSubmit={handleSubmit} className="auth-form" style={{gap:'1.25rem'}}>
            <div style={{display:'grid', gap:'.75rem', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
              {AREA_OPTIONS.map(opt => {
                const active = areas.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggle(opt)}
                    aria-pressed={active}
                    className="hero-btn"
                    style={{
                      background: active ? '#ff9bd2' : '#222a35',
                      color: active ? '#181a1f' : '#d0d9e5',
                      border: active ? '2px solid #ff4fa3' : '1px solid rgba(255,255,255,0.15)',
                      fontSize: '.7rem'
                    }}
                  >{opt}</button>
                );
              })}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="button" className="hero-btn" onClick={() => navigate('/signup')}>Back</button>
              <button type="submit" className="hero-btn primary" disabled={!areas.length}>Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

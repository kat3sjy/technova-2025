import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getCountries } from '../utils/locationData';
import './home-style.css';

const DRAFT_KEY = 'technova_personal_info_draft';

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [country, setCountry] = useState(user?.country || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prefill from localStorage if no user data is present
  useEffect(() => {
    if (!user) {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          setFirstName(draft.firstName || '');
          setLastName(draft.lastName || '');
          setCountry(draft.country || '');
        } catch {}
      }
    }
  }, [user]);

  function validate(): string | null {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!country) return 'Country is required.';
    return null;
  }

  function handleBack() {
    navigate('/');
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const issue = validate();
    if (issue) { setError(issue); return; }

    setSaving(true);
    const clean = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country,
    };

    if (user) {
      setUser({
        ...user,
        ...clean,
        location: country,
      });
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(clean));
    }

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 300);
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Basic Info</h1>
          <p className="hero-description">Set your first name, last name, and country.</p>

          <form onSubmit={handleSave} className="auth-form">
            <div className="form-group">
              <label className="form-label">First Name*</label>
              <input
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name*</label>
              <input
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Enter your last name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country*</label>
              <select
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {getCountries().map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" className="hero-btn" onClick={handleBack}>Back</button>
              <button type="submit" className="hero-btn primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>

            {saved && (
              <div className="auth-switch"><p>Saved</p></div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

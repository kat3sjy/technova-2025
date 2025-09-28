import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { validatePassword, hashPassword, storeCredentials, getStoredCredentials } from '../utils/password';
import { getCountries } from '../utils/locationData';
import "./home-style.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { users, registerUser, user, setUser } = useUserStore() as any;
  // step 1 credentials form
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  // step 2 basic info form
  const [basicInfo, setBasicInfo] = useState({ firstName: '', lastName: '', country: '' });
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If a user already exists but lacks basic info, jump straight to step 2
  useEffect(() => {
    if (user) {
      if (!user.firstName || !user.lastName || !user.country) {
        setStep(2);
        setBasicInfo({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          country: user.country || ''
        });
      }
    }
  }, [user]);

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

      // Check if username already exists
      const existingCreds = getStoredCredentials();
      if (existingCreds && existingCreds.username === form.username.trim().toLowerCase()) {
        setError('Username already exists. Please choose a different one.');
        setIsLoading(false);
        return;
      }

      // Check if user exists in users array
      const existingUser = users?.find((u: any) => u.username === form.username.trim().toLowerCase());
      if (existingUser) {
        setError('Username already exists. Please choose a different one.');
        setIsLoading(false);
        return;
      }

      // Hash password and store credentials
      const passwordHash = await hashPassword(form.password);
      storeCredentials({ username: form.username.trim().toLowerCase(), passwordHash, createdAt: new Date().toISOString() });

      // Create a minimal user (basic info collected step 2)
      const newUser = {
        id: crypto.randomUUID(),
        username: form.username.trim().toLowerCase(),
        firstName: '',
        lastName: '',
        country: '',
        location: '',
        areas: [],
        experienceLevel: '',
        goals: '',
        bio: '',
        avatarUrl: '',
        connections: [],
        incomingRequests: [],
        outgoingRequests: [],
        createdAt: new Date().toISOString()
      };
      registerUser(newUser);
      setStep(2); // show basic info inline instead of route navigation
      
    } catch (err) {
      setError('Sign up failed. Please try again.');
    }
    
    setIsLoading(false);
  }

  const handleBack = () => {
    navigate('/');
  };

  async function handleBasicInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!basicInfo.firstName.trim()) { setError('First name is required.'); return; }
    if (!basicInfo.lastName.trim()) { setError('Last name is required.'); return; }
    if (!basicInfo.country) { setError('Country is required.'); return; }
    if (user) {
      setUser({
        ...user,
        firstName: basicInfo.firstName.trim(),
        lastName: basicInfo.lastName.trim(),
        country: basicInfo.country,
        location: basicInfo.country
      });
      // Go to next onboarding step (focus areas) after inline basic info
      navigate('/onboarding/focus-areas');
    }
  }

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <div style={{position:'absolute', top:10, right:10, fontSize:'.65rem', opacity:0.6}}>Step {step} / 2</div>
          {step === 1 && (
            <>
              <h1 className="hero-title">Join Ctrl+Femme</h1>
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
                {error && <div className="error-message">{error}</div>}
                <div className="form-actions">
                  <Link to="/" className="hero-btn secondary">Back to Home</Link>
                  <button
                    type="submit"
                    className="hero-btn primary"
                    disabled={isLoading || !form.username.trim() || !form.password || !form.confirmPassword}
                  >{isLoading ? 'Creating Account...' : 'Create Account'}</button>
                </div>
                <div className="auth-switch">
                  <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
                </div>
              </form>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="hero-title">Basic Info</h1>
              <p className="hero-description">Tell us a little about yourself to personalize your experience.</p>
              <form onSubmit={handleBasicInfoSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">First Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    value={basicInfo.firstName}
                    onChange={e => setBasicInfo(b => ({ ...b, firstName: e.target.value }))}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    value={basicInfo.lastName}
                    onChange={e => setBasicInfo(b => ({ ...b, lastName: e.target.value }))}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country*</label>
                  <select
                    className="form-input"
                    value={basicInfo.country}
                    onChange={e => setBasicInfo(b => ({ ...b, country: e.target.value }))}
                    required
                  >
                    <option value="">Select your country</option>
                    {getCountries().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="form-actions">
                  <button type="button" className="hero-btn" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="hero-btn primary">Continue</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
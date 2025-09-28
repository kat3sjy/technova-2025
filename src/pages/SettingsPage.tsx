import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import { getCountries, getCities } from '../utils/locationData';
import './home-style.css';

export default function SettingsPage() {
  const { user, setUser, logout } = useUserStore() as any;
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  function update(field: string, value: string) {
    setUser({...user, [field]: value});
  }

  // Derive existing country/city from stored location "City, Country" or fallback
  const { initialCountry, initialCity } = useMemo(() => {
    if (!user.location) return { initialCountry: '', initialCity: '' };
  const parts = user.location.split(',').map((p: string) => p.trim());
    if (parts.length === 2) return { initialCity: parts[0], initialCountry: parts[1] };
    // If only one part, attempt to classify as country
    return { initialCountry: user.location, initialCity: '' };
  }, [user.location]);
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);

  function handleCountryChange(val: string) {
    setCountry(val);
    setCity('');
    const combined = val ? val : '';
    update('location', combined);
  }
  function handleCityChange(val: string) {
    setCity(val);
    const combined = val ? `${val}, ${country}` : country;
    update('location', combined);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (validation) {
      setImageError(validation);
      return;
    }

    try {
      setImageError('');
      const dataUrl = await handleImageUpload(file);
      setUser({...user, avatarUrl: dataUrl});
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // For now saving just sets timestamp (all updates are realtime already)
    setTimeout(() => {
      setSaving(false);
      setSavedAt(new Date().toLocaleTimeString());
    }, 400);
  }

  return (
    <div className="home-page">
      <div className="hero-section" style={{paddingTop:'2rem'}}>
        <div className="hero-content" style={{maxWidth:780}}>
          <h1 className="hero-title">Account Settings</h1>
          <p className="hero-description" style={{marginBottom:'1.75rem'}}>
            Update your profile details so others can discover and connect with you.
          </p>

          <form onSubmit={handleSave} className="auth-form" style={{marginTop:0}}>
            {/* Profile Picture */}
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
              <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
                {user.avatarUrl && (
                  <div style={{display:'flex', alignItems:'center', gap:'.75rem'}}>
                    <img
                      src={user.avatarUrl}
                      alt="Current profile"
                      style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', boxShadow:'0 0 0 2px rgba(255,255,255,0.15)'}}
                    />
                    <button
                      type="button"
                      className="hero-btn"
                      style={{fontSize:'.7rem', padding:'.4rem .75rem'}}
                      onClick={() => setUser({...user, avatarUrl: undefined})}
                    >Remove</button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  style={{padding:'.55rem'}}
                />
                {imageError && (
                  <div className="error-message" style={{marginTop:0}}>{imageError}</div>
                )}
                <p style={{fontSize:'.65rem', opacity:0.65, margin:0}}>Accepted: JPG, PNG, GIF • Max 5MB</p>
              </div>
            </div>

            {/* Name */}
            <div className="form-group" style={{display:'flex', gap:'.75rem'}}>
              <div style={{flex:1}}>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.firstName}
                  onChange={e => update('firstName', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div style={{flex:1}}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.lastName}
                  onChange={e => update('lastName', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Country & Region */}
            <div className="form-group" style={{display:'flex', gap:'.75rem'}}>
              <div style={{flex:1}}>
                <label className="form-label">Country</label>
                <select
                  className="form-input"
                  value={country}
                  onChange={e => handleCountryChange(e.target.value)}
                >
                  <option value="">Select country...</option>
                  {getCountries().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label className="form-label">State / Region</label>
                <select
                  className="form-input"
                  value={city}
                  disabled={!country}
                  onChange={e => handleCityChange(e.target.value)}
                >
                  <option value="">{country ? 'Select region...' : 'Select country first'}</option>
                  {getCities(country).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                rows={4}
                value={user.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder="Share a bit about your journey..."
                style={{resize:'vertical'}}
              />
            </div>

            <div className="form-actions" style={{marginTop:'1.75rem'}}>
              <button
                type="button"
                className="hero-btn"
                style={{background:'rgba(255,255,255,0.08)'}}
                onClick={logout}
              >Logout</button>
              <button
                type="submit"
                className="hero-btn primary"
                disabled={saving}
                style={{minWidth:'140px'}}
              >{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
            {savedAt && (
              <p style={{fontSize:'.65rem', opacity:.65, marginTop:'0.75rem'}}>Saved at {savedAt}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

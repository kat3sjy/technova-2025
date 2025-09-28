import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import './home-style.css';

export default function BioPicturePage() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore() as any;
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.avatarUrl || '');
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return <Navigate to="/signup" replace />;
  if (!user || !user.firstName || !user.lastName || !user.country) return <Navigate to="/signup" replace />;
  if (!user.areas?.length) return <Navigate to="/onboarding/focus-areas" replace />;
  if (!user.experienceLevel || !user.goals) return <Navigate to="/onboarding/experience-goals" replace />;

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) { setImageError(validation); return; }
    try {
      setImageError('');
      const dataUrl = await handleImageUpload(file);
      setProfilePicture(dataUrl);
    } catch (err) {
      setImageError('Upload failed.');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.trim()) { setError('Bio is required.'); return; }
    setSaving(true);
    setUser({ ...user, bio: bio.trim(), avatarUrl: profilePicture });
    navigate('/explore');
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Tell Your Story</h1>
          <p className="hero-description">Add a short bio and an optional profile picture so others can discover you.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Bio*</label>
              <textarea className="form-input" rows={5} value={bio} onChange={e => setBio(e.target.value)} placeholder="Share your journey, wins, and what you want to learn." required />
            </div>
            <div className="form-group">
              <label className="form-label">Profile Picture (Optional)</label>
              <input type="file" accept="image/*" onChange={onImageChange} style={{ padding: '.5rem' }} />
              {imageError && <p style={{color:'#ff9bd2', fontSize:'.7rem', margin:0}}>{imageError}</p>}
              {profilePicture && (
                <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginTop:'.5rem'}}>
                  <img src={profilePicture} alt="Preview" style={{width:60,height:60,borderRadius:'50%',objectFit:'cover'}} />
                  <button type="button" className="hero-btn" style={{fontSize:'.65rem'}} onClick={() => setProfilePicture('')}>Remove</button>
                </div>
              )}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="form-actions">
              <button type="button" className="hero-btn" onClick={() => navigate('/onboarding/experience-goals')}>Back</button>
              <button type="submit" className="hero-btn primary" disabled={!bio.trim() || saving}>{saving ? 'Saving...' : 'Finish'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getCountries } from '../utils/locationData';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import './home-style.css';

// New unified profile settings page (avatar + basic info + bio + goals) matching Basic Info aesthetic
export default function ProfileSettingsPage() {
  const { user, setUser } = useUserStore() as any;
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Settings</h1>
            <p className="hero-description">Please sign in to edit your profile.</p>
            <div className="auth-form" style={{maxWidth:400}}>
              <a className="hero-btn primary" href="/login">Sign In</a>
              <a className="hero-btn" href="/signup">Create Account</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [country, setCountry] = useState(user.country || user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [goals, setGoals] = useState(user.goals || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function validate(): string | null {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!country) return 'Country is required.';
    return null;
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const issue = validateImageFile(file as any);
    if (issue) { setImageError(issue); return; }
    try {
      setAvatarUploading(true);
      setImageError('');
      const dataUrl = await handleImageUpload(file as any);
      setUser({ ...user, avatarUrl: dataUrl });
    } catch (err: any) {
      setImageError(err?.message || 'Failed to upload image');
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const issue = validate();
    if (issue) { setError(issue); return; }
    setSaving(true);
    const updated = {
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location: country,
      country,
      bio: bio.trim(),
      goals: goals.trim()
    };
    setUser(updated);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 350);
  }

  return (
    <div className="home-page">
      <div className="hero-section" style={{padding:'3rem 2rem'}}>
        <div className="hero-content">
          <h1 className="hero-title">Profile Settings</h1>
          <p className="hero-description">Update your picture, basic info, bio, and goals.</p>
          <form onSubmit={handleSave} className="auth-form" style={{maxWidth:760, width:'100%'}}>
            {/* Avatar */}
            <div className="form-group" style={{alignItems:'flex-start'}}>
              <label className="form-label" style={{textTransform:'none'}}>Profile Picture</label>
              <div style={{display:'flex', flexDirection:'column', gap:'.75rem', width:'100%', alignItems:'flex-start'}}>
                <div style={{display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.username)}`}
                    alt="avatar"
                    style={{width:96, height:96, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.4)'}}
                  />
                  <div style={{display:'flex', flexDirection:'column', gap:'.5rem'}}>
                    <input type="file" accept="image/*" onChange={onAvatarChange} disabled={avatarUploading} className="form-input" style={{padding:'.5rem .75rem'}} />
                    {user.avatarUrl && (
                      <button type="button" className="hero-btn" style={{background:'rgba(255,255,255,0.2)', fontSize:'.65rem'}} onClick={()=> setUser({...user, avatarUrl: undefined})}>Remove</button>
                    )}
                  </div>
                </div>
                {avatarUploading && <p style={{fontSize:'.6rem', margin:0, opacity:.7}}>Uploading…</p>}
                {imageError && <p style={{color:'#ff9bd2', fontSize:'.6rem', margin:0}}>{imageError}</p>}
                <p style={{fontSize:'.55rem', margin:0, opacity:.6}}>JPG / PNG / GIF up to 5MB.</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">First Name*</label>
              <input className="form-input" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Last Name*</label>
              <input className="form-input" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" />
            </div>
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Country*</label>
              <select className="form-input" value={country} onChange={e=>setCountry(e.target.value)}>
                <option value="">Select your country</option>
                {getCountries().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" style={{minHeight:140, resize:'vertical'}} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell others about your background, interests, and what you bring." />
            </div>

            {/* Goals */}
            <div className="form-group" style={{margin:0}}>
              <label className="form-label">Goals</label>
              <textarea className="form-input" style={{minHeight:140, resize:'vertical'}} value={goals} onChange={e=>setGoals(e.target.value)} placeholder="Share what you want to learn, build, or accomplish." />
            </div>

            {error && <div className="error-message" style={{marginTop:'.5rem'}}>{error}</div>}

            <div className="form-actions" style={{marginTop:'1rem'}}>
              <button type="button" className="hero-btn" onClick={()=>navigate(-1)}>Back</button>
              <button type="submit" className="hero-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
            {saved && <div className="auth-switch"><p>Saved</p></div>}
          </form>
        </div>
      </div>
    </div>
  );
}

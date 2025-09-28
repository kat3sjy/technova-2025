import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { generateUsername } from '../utils/generateUsername';
import { validatePassword } from '../utils/password';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import { getCountries, getCities } from '../utils/locationData';

interface FormState {
  username: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  location: string; // derived country + city for backward compatibility
  areas: string[];
  experienceLevel: string;
  goals: string;
  bio: string;
  profilePicture: string;
}

const AREA_OPTIONS = ['Gaming', 'Esports', 'Game Dev', 'Tech Conventions', 'Sports Analytics', 'Sports Performance', 'VR/AR', 'Web Dev'];
const EXPERIENCE_LEVELS = ['Student', 'Newbie', 'Amateur', 'Intermediate', 'Pro'];

export default function OnboardingPage() {
  const { user, registerUser, getUserByUsername, users } = useUserStore() as any;
  const [step, setStep] = useState(0);
  const existingCreds = undefined as any;
  const [form, setForm] = useState<FormState>({
    username: existingCreds?.username || '', password: '', passwordConfirm: '',
    firstName: '', lastName: '', country: '', city: '', location: '', areas: [], experienceLevel: '', goals: '', bio: '',
    profilePicture: ''
  });
  const [locationSelect, setLocationSelect] = useState('');
  const [pwdIssues, setPwdIssues] = useState<Array<string>>([]);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [imageError, setImageError] = useState('');

  function toggleArea(area: string) {
    setForm((f: FormState) => ({
      ...f,
      areas: f.areas.includes(area)
        ? f.areas.filter((a: string) => a !== area)
        : [...f.areas, area]
    }));
  }

  function next() { setStep((s: number) => Math.min(s + 1, steps.length - 1)); }
  function prev() { setStep((s: number) => Math.max(s - 1, 0)); }

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
      setForm((f: FormState) => ({ ...f, profilePicture: dataUrl }));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }

  // Step validation logic
  const stepValid = (current: number): boolean => {
    switch (current) {
      case 0: { // credentials
        const uname = form.username.trim();
        const unameOk = /^[a-zA-Z0-9_-]{3,24}$/.test(uname);
        const pwOk = form.password.length > 0 && validatePassword(form.password).length === 0 && form.password === form.passwordConfirm;
        return unameOk && pwOk;
      }
      case 1: // basic info (country + city required)
        return !!(form.firstName.trim() && form.lastName.trim() && form.country && form.city);
      case 2: // focus areas
        return form.areas.length > 0;
      case 3: // experience & goals
        return !!(form.experienceLevel && form.goals.trim());
      case 4: // bio
        return !!form.bio.trim();
      default:
        return false;
    }
  };

  async function handleSubmit() {
    if (![0,1,2,3,4].every(stepValid)) return;
    const uname = form.username.trim();
    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(uname)) { setUsernameError('Invalid username'); return; }
    // Uniqueness check
    const taken = getUserByUsername(uname.toLowerCase());
    if (taken) {
      setUsernameError('Username already taken');
      return;
    }
    const pwdProblems = validatePassword(form.password);
    const mismatch = form.password !== form.passwordConfirm;
    if (pwdProblems.length || mismatch) { setPwdIssues([...pwdProblems, ...(mismatch? ['Passwords do not match']: [])]); return; }
    // Create account if not exists
    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname.toLowerCase(), password: form.password })
      });
      if (!signupRes.ok && signupRes.status !== 409) {
        const j = await signupRes.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to create account');
      }
    } catch (e) {
      // If 409 username taken, we proceed to update profile of existing user
    }
    // Update profile fields
    const combinedLocation = form.country && form.city ? `${form.city}, ${form.country}` : form.country || form.city || '';
    const profileRes = await fetch('/api/profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname.toLowerCase(), firstName: form.firstName, lastName: form.lastName, tags: form.areas, experienceLevel: form.experienceLevel, goals: form.goals, bio: form.bio, location: combinedLocation })
    });
    if (!profileRes.ok) {
      const j = await profileRes.json().catch(() => ({}));
      setUsernameError(j?.error || 'Unable to save profile');
      return;
    }
    const userDoc = await profileRes.json();
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
      createdAt: userDoc.createdAt || new Date().toISOString(),
      avatarUrl: form.profilePicture || undefined
    });
  }

  const steps = [
    <div key="step-credentials">
      <h2>Create Your Account</h2>
      <FormRow label="Username *">
        <input
          value={form.username}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUsernameTouched(true);
            const val = e.target.value;
            setForm((f: FormState) => ({ ...f, username: val }));
            if (!/^[a-zA-Z0-9_-]{3,24}$/.test(val)) {
              setUsernameError('3-24 letters, numbers, _ or -');
            } else if (getUserByUsername(val.toLowerCase())) {
              setUsernameError('Username already taken');
            } else {
              setUsernameError('');
            }
          }}
          placeholder="yourhandle"
        />
      </FormRow>
      {(usernameError || (usernameTouched && !form.username)) && (
        <p style={{color:'#ff9bd2', fontSize:'.7rem', marginTop:'-.25rem'}}>{usernameError || 'Username required'}</p>
      )}
      <FormRow label="Password *">
        <input
          type="password"
          value={form.password}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setForm((f: FormState) => ({ ...f, password: val }));
            setPwdIssues(validatePassword(val));
          }}
          placeholder="Strong password"
          autoComplete="new-password"
        />
      </FormRow>
      <FormRow label="Confirm Password *">
        <input
          type="password"
            value={form.passwordConfirm}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value;
              setForm((f: FormState) => ({ ...f, passwordConfirm: val }));
              if (form.password) {
                setPwdIssues((prev: string[]) => prev.filter((p: string) => p !== 'Passwords do not match'));
                if (val !== form.password) setPwdIssues((prev: string[]) => [...prev.filter((p: string) => p !== 'Passwords do not match'), 'Passwords do not match']);
              }
            }}
            placeholder="Re-enter password"
            autoComplete="new-password"
        />
      </FormRow>
      {pwdIssues.length > 0 && (
        <ul style={{marginTop:'.5rem', paddingLeft:'1.1rem', color:'#ff9bd2', fontSize:'.7rem'}}>
          {pwdIssues.map((i: string) => <li key={i}>{i}</li>)}
        </ul>
      )}
      <p style={{opacity:.6, fontSize:'.65rem', marginTop:'.5rem'}}>Prototype only: credentials stored locally (hashed).</p>
    </div>,
    <div key="step-basic">
      <h2>Basic Info</h2>
      <FormRow label="First Name">
        <input
          value={form.firstName}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((f: FormState) => ({ ...f, firstName: e.target.value }))
          }
        />
      </FormRow>
      <FormRow label="Last Name">
        <input
          value={form.lastName}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((f: FormState) => ({ ...f, lastName: e.target.value }))
          }
        />
      </FormRow>
      <FormRow label="Country">
        <select
          value={form.country}
          required
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const country = e.target.value;
            setForm(f => ({ ...f, country, city: '', location: country }));
          }}
        >
          <option value="">Select country...</option>
          {getCountries().map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormRow>
      <FormRow label="State / Province / Region">
        <select
          value={form.city}
          required
          disabled={!form.country}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const city = e.target.value;
            setForm(f => ({ ...f, city, location: city ? `${city}, ${f.country}` : f.country }));
          }}
        >
          <option value="">{form.country ? 'Select region...' : 'Select country first'}</option>
          {getCities(form.country).map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </FormRow>
    </div>,
    <div key="step-areas">
      <h2>Focus Areas</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))'}}>
        {AREA_OPTIONS.map((opt: string) => {
          const active = form.areas.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggleArea(opt)}
              aria-pressed={active}
              aria-label={`${opt}${active ? ' selected' : ''}`}
              style={{
                background: active ? '#ff9bd2' : '#222a35',
                color: active ? '#181a1f' : '#d0d9e5'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>,
    <div key="step-exp">
      <h2>Experience & Goals</h2>
      <FormRow label="Experience Level">
        <select
          value={form.experienceLevel}
          required
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setForm((f: FormState) => ({ ...f, experienceLevel: e.target.value }))
          }
        >
          <option value="">Select...</option>
          {EXPERIENCE_LEVELS.map((l: string) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Goals">
        <textarea
          rows={4}
          value={form.goals}
          required
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm((f: FormState) => ({ ...f, goals: e.target.value }))
          }
          placeholder="What do you hope to achieve?"
        />
      </FormRow>
    </div>,
    <div key="step-bio">
      <h2>Bio & Profile Picture</h2>
      <FormRow label="About You">
        <textarea
          rows={5}
          value={form.bio}
          required
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setForm((f: FormState) => ({ ...f, bio: e.target.value }))
          }
          placeholder="Share your journey, wins, and what you want to learn."
        />
      </FormRow>
      <FormRow label="Profile Picture (Optional)">
        <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{padding:'.5rem'}}
          />
          {imageError && (
            <p style={{color:'#ff9bd2', fontSize:'.7rem', margin:0}}>{imageError}</p>
          )}
          {form.profilePicture && (
            <div style={{display:'flex', alignItems:'center', gap:'.75rem'}}>
              <img 
                src={form.profilePicture} 
                alt="Preview" 
                style={{width:'60px', height:'60px', borderRadius:'50%', objectFit:'cover'}}
              />
              <button 
                type="button" 
                onClick={() => setForm((f: FormState) => ({ ...f, profilePicture: '' }))}
                style={{fontSize:'.7rem', padding:'.25rem .5rem'}}
              >
                Remove
              </button>
            </div>
          )}
          <p style={{fontSize:'.65rem', opacity:0.7, margin:0}}>
            Accepted formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>
      </FormRow>
      <button onClick={handleSubmit} disabled={![0,1,2,3,4].every(stepValid)}>Finish & Create Profile</button>
    </div>
  ];

  if (user) {
    return <div className="card"><h2>You're onboarded 🎉</h2><p>View your profile or explore others.</p></div>;
  }

  return (
    <div className="grid" style={{gap:'1.25rem', maxWidth:680}}>
      <Progress value={(step+1)/steps.length} />
      <div className="card">
        {steps[step]}
        <div className="flex space-between" style={{marginTop:'1rem'}}>
          <button type="button" onClick={prev} disabled={step===0}>Back</button>
          {step < steps.length-1 && <button type="button" onClick={next} disabled={!stepValid(step)}>Next</button>}
        </div>
      </div>
    </div>
  );
}

function FormRow({label, children}:{label:string; children:React.ReactNode}) {
  return <div className="form-row"><label>{label}</label>{children}</div>;
}

function Progress({value}:{value:number}) {
  return (
    <div style={{height:10, background:'#222a35', borderRadius:8, overflow:'hidden'}}>
      <div style={{height:'100%', width:`${Math.round(value*100)}%`, background:'linear-gradient(90deg,#ff4fa3,#ff9bd2)'}} />
    </div>
  );
}

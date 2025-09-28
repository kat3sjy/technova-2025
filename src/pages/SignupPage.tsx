import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const uname = username.trim();
    if (!uname || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: uname, password })
      });

      const raw = await res.text();
      let data: any = undefined;
      try { data = raw ? JSON.parse(raw) : undefined; } catch {}

      if (res.ok) {
        navigate('/onboarding', { replace: true });
        return;
      }

      if (res.status === 409) {
        setError('Username already taken');
      } else {
        setError((data?.error || data?.message || raw || 'Sign up failed. Please try again.'));
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        autoComplete="username"
        disabled={loading}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="new-password"
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Sign Up'}</button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
};

export default SignupForm;

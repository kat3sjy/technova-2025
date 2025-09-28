import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const username = String(form.get('username') || '').trim();
      const password = String(form.get('password') || '');

      if (!username || !password) {
        setError('Username and password are required.');
        return;
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} noValidate>
        <input
          name="username"
          type="text"
          autoComplete="username"
          disabled={loading}
          required
        />
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
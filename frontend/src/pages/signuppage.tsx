import React, { useState } from 'react';
// ...existing imports...
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function SignupPage() {
	// ...existing code...
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		const u = username.trim();
		const p = password;

		// Guard against accidental file paths or source file strings
		if (!u || !p) {
			setError('Username and password are required.');
			return;
		}
		if (u.includes('/') || u.includes('\\') || u.endsWith('.tsx') || u.endsWith('.ts') || u.endsWith('.js')) {
			setError('Please enter a valid username (not a file path).');
			return;
		}

		const payload = { username: u, password: p };
		console.debug('[signup.form] will send:', { username: u, password: '***', API_BASE });

		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/api/auth/signup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload),
			});

			// Read raw text first, then try JSON so we can show useful errors
			const raw = await res.text();
			let data: any = undefined;
			try { data = raw ? JSON.parse(raw) : undefined; } catch {}

			console.debug('[signup.form] response:', { status: res.status, ok: res.ok, body: data ?? raw });

			if (res.ok) {
				// Success on any 2xx (201 included) regardless of body shape
				setSuccess('Account created!');
				// Optionally: localStorage.setItem('user', JSON.stringify(data?.user));
				navigate('/onboarding', { replace: true });
				return;
			}

			// Non-2xx: show server error if present
			if (res.status === 409) {
				setError('Username already taken');
			} else {
				const serverMsg = (data && (data.error || data.message)) || raw || 'Sign up failed. Please try again.';
				setError(`Sign up failed (${res.status}). ${serverMsg}`);
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: '2rem auto' }}>
			<h1>Create account</h1>
			<form onSubmit={handleSubmit} noValidate>
				<label>
					Username
					<input
						name="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.currentTarget.value)}
						autoComplete="username"
						pattern="^[A-Za-z0-9._-]{3,32}$"
						title="3-32 characters; letters, numbers, dot, underscore, dash"
						minLength={3}
						maxLength={32}
						disabled={loading}
						required
					/>
				</label>
				<br />
				<label>
					Password
					<input
						name="new-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
						autoComplete="new-password"
						minLength={6}
						maxLength={128}
						disabled={loading}
						required
					/>
				</label>
				<br />
				<button type="submit" disabled={loading}>
					{loading ? 'Creating…' : 'Sign up'}
				</button>
			</form>

			{error && <p style={{ color: 'crimson' }}>{error}</p>}
			{success && <p style={{ color: 'green' }}>{success}</p>}
		</div>
	);
	// ...existing code...
}

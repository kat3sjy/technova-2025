import { useEffect, useState } from 'react';

type UserPreview = {
  _id: string;
  username: string;
  location?: string;
  goals?: string;
  experienceLevel?: string;
  bio?: string;
};

type AnalysisPayload = {
  users?: UserPreview[];
  resultText?: string;
  result?: string;
};

type UserCard = {
  user: UserPreview;
  analysis: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function AIDemoPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let alive = true;

    const sampleTwo = <T,>(arr: T[]): T[] => {
      if (!Array.isArray(arr)) return [];
      if (arr.length <= 2) return arr.slice(0, 2);
      const i = Math.floor(Math.random() * arr.length);
      let j = Math.floor(Math.random() * arr.length);
      if (j === i) j = (j + 1) % arr.length;
      return [arr[i], arr[j]];
    };

    async function fetchRandomUsers(): Promise<UserPreview[]> {
      const tryUrls = [
        `${API_BASE}/api/users/random?limit=2`,
        `${API_BASE}/api/users?limit=50`,
        `${API_BASE}/api/users`
      ];
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, { credentials: 'include' });
          const txt = await res.text();
          const data = txt ? JSON.parse(txt) : null;
          if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
          const list = Array.isArray(data) ? data : (data?.users || []);
          const picked = url.includes('/random') ? (list || []) : sampleTwo(list || []);
          if (picked?.length) return picked.slice(0, 2);
        } catch {
          // try next
        }
      }
      return [];
    }

    async function loadTwo() {
      setLoading(true);
      setError('');
      try {
        const users = await fetchRandomUsers();
        if (!users.length) throw new Error('No users found');
        const next = users.slice(0, 2).map((u) => ({ user: u, analysis: '' }));
        if (alive) setCards(next);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Failed to load users');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadTwo();
    return () => { alive = false; };
  }, []);

  async function shuffle() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/random?limit=2`, { credentials: 'include' });
      let users: UserPreview[] = [];
      try {
        const txt = await res.text();
        const data = txt ? JSON.parse(txt) : null;
        users = Array.isArray(data) ? data : (data?.users || []);
      } catch {
        users = [];
      }
      if (!res.ok || !users.length) {
        // fallback: reuse initial logic via analyze list endpoints
        const fallback = await (async () => {
          const r = await fetch(`${API_BASE}/api/users?limit=50`, { credentials: 'include' });
          const t = await r.text();
          const d = t ? JSON.parse(t) : null;
          const list = Array.isArray(d) ? d : (d?.users || []);
          return list;
        })().catch(() => []);
        users = (fallback as UserPreview[]).slice(0, 2);
      }
      setCards((users || []).slice(0, 2).map((u) => ({ user: u, analysis: '' })));
    } catch (e: any) {
      setError(e?.message || 'Failed to shuffle users');
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (cards.length < 2) return;
    setError('');
    setAnalyzing(true);
    try {
      const ids = cards.map((c) => c.user._id);
      const res = await fetch(`${API_BASE}/api/compat/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids })
      });
      const txt = await res.text();
      const data: AnalysisPayload = txt ? JSON.parse(txt) : {};
      if (!res.ok) throw new Error((data as any)?.error || txt || `HTTP ${res.status}`);
      const analysisText = data.resultText || data.result || '';
      setCards((prev) => prev.map((c) => ({ ...c, analysis: analysisText })));
    } catch (e: any) {
      setError(e?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="grid" style={{ gap: '1.25rem', maxWidth: 1000, margin: '24px auto', padding: 16 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>AI Compatibility Demo</h1>
        <div className="flex" style={{ gap: 8, marginTop: 8 }}>
          <button type="button" onClick={shuffle} disabled={loading || analyzing}>Shuffle two profiles</button>
          <button type="button" onClick={runAnalysis} disabled={loading || analyzing || cards.length < 2}>
            {analyzing ? 'Analyzing…' : 'Perform AI analysis'}
          </button>
        </div>
        {(loading || analyzing) && <div style={{ opacity: 0.8, marginTop: 8 }}>{loading ? 'Loading profiles…' : 'Analyzing…'}</div>}
        {error && <div style={{ color: '#ff9bd2', marginTop: 12 }}>{error}</div>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {cards.map(({ user, analysis }) => (
          <div key={user._id} className="card">
            <h3 style={{ marginTop: 0 }}>{user.username || '(unknown user)'}</h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {user.experienceLevel && (
                <span style={{ background: '#222a35', color: '#d0d9e5', borderRadius: 9999, padding: '2px 8px', fontSize: '.8rem' }}>
                  {user.experienceLevel}
                </span>
              )}
              {user.location && (
                <span style={{ background: '#222a35', color: '#d0d9e5', borderRadius: 9999, padding: '2px 8px', fontSize: '.8rem' }}>
                  {user.location}
                </span>
              )}
            </div>

            {user.goals && (
              <div style={{ marginTop: 6, fontSize: '.9rem', opacity: 0.9 }}>
                <strong>Goals:</strong> {user.goals}
              </div>
            )}
            {user.bio && (
              <div style={{ marginTop: 6, fontSize: '.9rem', opacity: 0.9 }}>
                <strong>Bio:</strong> {user.bio}
              </div>
            )}
            {analysis && (
              <div style={{ marginTop: 12, fontSize: '.9rem' }}>
                {analysis}
              </div>
            )}
          </div>
        ))}

        {!loading && cards.length === 0 && !error && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ opacity: 0.7 }}>No results yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}

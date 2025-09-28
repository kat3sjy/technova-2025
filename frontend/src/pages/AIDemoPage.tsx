import { useEffect, useState } from 'react';

type DemoUser = {
  _id: string;
  username: string;
  location: string;
  goals: string;
  experienceLevel: string;
  bio: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AIDemoPage() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const twoIds = users.map(u => u._id);

  async function fetchTwo() {
    setLoading(true);
    setAnalysis('');
    try {
      const res = await fetch(`${API_BASE}/api/compat/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : null;
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (e) {
      console.error('fetchTwo failed', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (twoIds.length !== 2) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/api/compat/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: twoIds })
      });
      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : {};
      if (Array.isArray(data?.users)) setUsers(data.users);
      setAnalysis(
        typeof data?.analysisText === 'string'
          ? data.analysisText
          : (typeof data?.resultText === 'string' ? data.resultText : '')
      );
    } catch (e) {
      console.error('runAnalysis failed', e);
      setAnalysis('Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    // On mount, load two random users (no auto-analyze)
    fetchTwo();
  }, []);

  return (
    <div className="ai-demo-page">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>AI Compatibility Demo</h1>
        <div className="controls" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={fetchTwo} disabled={loading} className="chip-btn">
            {loading ? 'Shuffling…' : 'Shuffle two profiles'}
          </button>
          <button onClick={runAnalysis} disabled={analyzing || users.length !== 2} className="chip-btn primary">
            {analyzing ? 'Analyzing…' : 'Perform AI analysis'}
          </button>
        </div>
        {(loading || analyzing) && <div style={{ opacity: 0.8, marginTop: 8 }}>{loading ? 'Loading profiles…' : 'Analyzing…'}</div>}
      </div>

      <div className="cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginTop: 16 }}>
        {users.map((u) => (
          <div key={u._id} className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600 }}>{u.username || '(unknown user)'}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {u.experienceLevel && (
                  <span className="chip" style={{ background: '#222a35', color: '#d0d9e5', borderRadius: 9999, padding: '2px 8px', fontSize: '.8rem' }}>
                    {u.experienceLevel}
                  </span>
                )}
                {u.location && (
                  <span className="chip" style={{ background: '#222a35', color: '#d0d9e5', borderRadius: 9999, padding: '2px 8px', fontSize: '.8rem' }}>
                    {u.location}
                  </span>
                )}
              </div>
            </div>
            <div className="card-content">
              {u.goals && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 500 }}>Goals</div>
                  <div>{u.goals}</div>
                </div>
              )}
              {u.bio && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 500 }}>Bio</div>
                  <div>{u.bio}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {analysis && (
        <div className="analysis card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>AI Analysis</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{analysis}</pre>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ opacity: 0.7 }}>No results yet.</div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

type UserPreview = {
  _id: string;
  username: string;
  goals: string[];
  location?: string;
  experienceLevel?: string;
};

export default function AIDemoPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserPreview[]>([]);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setUsers([]);
    try {
      const res = await fetch('/api/compat/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Optional: pass specific IDs as { ids: ["<id1>","<id2>"] }
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const data = await res.json();
      console.log('AI analyze response:', data);
      setUsers(data.users || []);
      setResult(
        data.analysis ||
        data.text ||
        data.result ||
        data.message ||
        data.content ||
        data.resultText ||
        ''
      );
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: 16 }}>
      <h1>AI Compatibility Demo</h1>

      <button onClick={runAnalysis} disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? 'Analyzing...' : 'Run Compatibility Analysis'}
      </button>

      {error && (
        <div style={{ color: 'crimson', marginTop: 12 }}>
          {error}
        </div>
      )}

      {/* Chat-style blocks */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map((u, idx) => {
          const label = idx === 0 ? 'User A' : idx === 1 ? 'User B' : `User ${idx + 1}`;
          return (
            <div key={u._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#eef7ff' }}>
              <div style={{ fontWeight: 600 }}>
                {label} — {u.username || '(unknown user)'}{' '}
                <span style={{ color: '#555', fontWeight: 400 }}>({u._id})</span>
              </div>
              <div style={{ fontSize: 14, marginTop: 6, color: '#333' }}>
                {u.location ? <div>Location: {u.location}</div> : null}
                {u.experienceLevel ? <div>Experience: {u.experienceLevel}</div> : null}
                {(u.goals || []).length ? (
                  <div>
                    Goals:
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {u.goals.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {result ? (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#f7f7f7' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>AI Analysis</div>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#000' }}>{result}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

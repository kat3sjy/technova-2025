import { useEffect, useState } from 'react';

type UserPreview = {
  _id: string;
  username: string;
  vibeTags: string[];
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

export default function AIDemoPage() {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Fetch a few analyses in parallel to get ~4 unique users
        const fetchAnalysis = async (): Promise<AnalysisPayload> => {
          const res = await fetch('/api/compat/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // backend selects users
          });
          const txt = await res.text();
          const data = txt ? JSON.parse(txt) : {};
          if (!res.ok) throw new Error(data?.error || txt || `HTTP ${res.status}`);
          return data;
        };

        const results = await Promise.allSettled([
          fetchAnalysis(),
          fetchAnalysis(),
          fetchAnalysis()
        ]);

        const seen = new Set<string>();
        const nextCards: UserCard[] = [];

        for (const r of results) {
          if (r.status !== 'fulfilled') continue;
          const users = r.value.users || [];
          const analysisText = r.value.resultText || r.value.result || '';
          for (const u of users) {
            if (!u?._id) continue;
            if (seen.has(u._id)) continue;
            seen.add(u._id);
            nextCards.push({ user: u, analysis: analysisText });
            if (nextCards.length >= 4) break;
          }
          if (nextCards.length >= 4) break;
        }

        if (alive) setCards(nextCards);
      } catch (e: any) {
        if (alive) setError(e?.message || 'Request failed');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: 16 }}>
      <h1>AI Compatibility Demo</h1>

      {loading && <div>Analyzing...</div>}
      {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 16,
          marginTop: 16
        }}
      >
        {cards.map(({ user, analysis }) => (
          <div key={user._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{user.username || '(unknown user)'}</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {(user.vibeTags || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            {analysis && (
              <div style={{ marginTop: 12, fontSize: '.9rem', color: '#333' }}>
                {analysis}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

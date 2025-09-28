import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { MOCK_PROFILES } from '../mock/profiles';
import { analyzeProfile, scoreCompatibility, getAIStatus } from '../lib/aiApi';
import { isLikelyFallbackSummary } from '../lib/aiApi';
const AIDemoPage = () => {
    const profiles = MOCK_PROFILES;
    const [aIndex, setAIndex] = useState(0);
    const [bIndex, setBIndex] = useState(1);
    const [analysis, setAnalysis] = useState(null);
    const [score, setScore] = useState(null);
    const aJson = useMemo(() => JSON.stringify(profiles[aIndex], null, 2), [profiles, aIndex]);
    const bJson = useMemo(() => JSON.stringify(profiles[bIndex], null, 2), [profiles, bIndex]);
    const onAnalyze = async () => {
        setScore(null);
        setAnalysis('loading...');
        try {
            const res = await analyzeProfile(profiles[aIndex]);
            setAnalysis(res);
        }
        catch (e) {
            setAnalysis({ error: e?.message ?? String(e) });
        }
    };
    const onScore = async () => {
        setAnalysis(null);
        setScore('loading...');
        try {
            const res = await scoreCompatibility(profiles[aIndex], profiles[bIndex]);
            setScore(res);
        }
        catch (e) {
            setScore({ error: e?.message ?? String(e) });
        }
    };
    // Analysis UI state
    const [analyses, setAnalyses] = useState({});
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const runMockAnalyses = async () => {
        setAnalyzing(true);
        setAnalysisError(null);
        try {
            const results = await Promise.all(MOCK_PROFILES.map((p) => analyzeProfile(p)));
            const byId = {};
            MOCK_PROFILES.forEach((p, i) => { byId[p.id] = results[i]; });
            setAnalyses(byId);
        }
        catch (err) {
            setAnalysisError(err?.message || 'Failed to analyze profiles');
        }
        finally {
            setAnalyzing(false);
        }
    };
    const [aiStatus, setAiStatus] = useState(null);
    const [statusError, setStatusError] = useState(null);
    useEffect(() => {
        getAIStatus()
            .then(s => setAiStatus(s))
            .catch(err => setStatusError(err?.message || 'Failed to fetch AI status'));
    }, []);
    const clientModelHint = import.meta?.env?.VITE_GEMINI_MODEL;
    const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
    // DB seed check state
    const [dbUsers, setDbUsers] = useState([]);
    const [dbLoading, setDbLoading] = useState(false);
    const [dbError, setDbError] = useState(null);
    const loadDbUsers = async () => {
        setDbLoading(true);
        setDbError(null);
        try {
            const res = await fetch(`${API_BASE}/api/profile?limit=12`);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setDbUsers(Array.isArray(data) ? data : []);
        }
        catch (e) {
            setDbError(e?.message || 'Failed to load users');
        }
        finally {
            setDbLoading(false);
        }
    };
    const anyLoading = analyzing || analysis === 'loading...' || score === 'loading...';
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h1", { children: "AI Demo" }), statusError && (_jsxs("div", { style: { margin: '8px 0', padding: 8, background: '#fff3cd', border: '1px solid #ffecb5', borderRadius: 6, color: '#664d03' }, children: ["Status error: ", statusError] })), aiStatus && (_jsxs("div", { style: { margin: '8px 0', padding: 8, background: aiStatus.configured ? '#e7f5ff' : '#fff3cd', border: '1px solid #d0ebff', borderRadius: 6 }, children: [_jsxs("div", { style: { fontSize: 13 }, children: ["AI status: ", aiStatus.configured ? `configured (server: ${aiStatus.model || 'unknown'})` : 'not configured — using fallback summaries', clientModelHint ? ` — client hint: ${clientModelHint}` : '', aiStatus.lastModelUsed ? ` — last model used: ${aiStatus.lastModelUsed}` : ''] }), aiStatus.lastError && (_jsxs("div", { style: { fontSize: 12, color: '#b00020', marginTop: 4 }, children: ["Last AI error: ", aiStatus.lastError] }))] })), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsxs("label", { children: ["Profile A:", ' ', _jsx("select", { value: aIndex, onChange: (e) => setAIndex(Number(e.target.value)), disabled: anyLoading, children: profiles.map((p, i) => (_jsx("option", { value: i, children: p.name }, p.id))) })] }), _jsxs("label", { children: ["Profile B:", ' ', _jsx("select", { value: bIndex, onChange: (e) => setBIndex(Number(e.target.value)), disabled: anyLoading, children: profiles.map((p, i) => (_jsx("option", { value: i, children: p.name }, p.id))) })] }), _jsx("button", { onClick: onAnalyze, disabled: anyLoading, children: "Analyze A" }), _jsx("button", { onClick: onScore, disabled: anyLoading, children: "Score A\u2194B" })] }), _jsxs("div", { style: { marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("h3", { children: "Profile A" }), _jsx("pre", { children: aJson })] }), _jsxs("div", { children: [_jsx("h3", { children: "Profile B" }), _jsx("pre", { children: bJson })] })] }), _jsxs("div", { style: { marginTop: 16 }, children: [analysis && (_jsxs(_Fragment, { children: [_jsx("h3", { children: "Analysis" }), _jsx("pre", { children: typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2) })] })), score && (_jsxs(_Fragment, { children: [_jsx("h3", { children: "Compatibility" }), _jsx("pre", { children: typeof score === 'string' ? score : JSON.stringify(score, null, 2) })] }))] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "AI Profile Analysis (mock)" }), _jsx("p", { children: "Generates a paragraph summary per profile using Gemini via /api/ai/analyze." }), _jsx("button", { onClick: runMockAnalyses, disabled: analyzing, children: analyzing ? 'Analyzing…' : 'Analyze mock profiles' }), analysisError && _jsx("div", { style: { color: 'red', marginTop: 8 }, children: analysisError }), Object.keys(analyses).length > 0 && (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }, children: MOCK_PROFILES.map((p) => {
                            const a = analyses[p.id];
                            if (!a)
                                return null;
                            // Be resilient to different shapes from the server and fallback
                            const summary = a?.summary ??
                                a?.paragraph ??
                                a?.text ??
                                a?.analysis?.summary ??
                                '';
                            const meta = a?._meta;
                            const fallbackish = (meta && typeof meta.usedFallback === 'boolean')
                                ? meta.usedFallback
                                : isLikelyFallbackSummary(summary);
                            return (_jsxs("div", { style: { border: '1px solid #ddd', borderRadius: 8, padding: 12 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 6 }, children: [_jsx("span", { children: p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.username || p.id }), fallbackish && (_jsxs("span", { style: { fontSize: 11, color: '#666', border: '1px solid #ddd', borderRadius: 6, padding: '1px 6px' }, children: ["fallback", meta?.model ? ` (${meta.model})` : ''] }))] }), _jsx("div", { style: { marginTop: 4, lineHeight: 1.5 }, children: summary || '—' })] }, p.id));
                        }) }))] }), _jsxs("section", { style: { marginTop: 24 }, children: [_jsx("h2", { children: "Database seed check" }), _jsx("p", { children: "Click to fetch recently created users from MongoDB." }), _jsx("button", { onClick: loadDbUsers, disabled: dbLoading, children: dbLoading ? 'Loading…' : 'Load DB users' }), dbError && _jsx("div", { style: { color: 'red', marginTop: 8 }, children: dbError }), dbUsers.length > 0 && (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 12 }, children: dbUsers.map((u) => (_jsxs("div", { style: { border: '1px solid #ddd', borderRadius: 8, padding: 10 }, children: [_jsx("div", { style: { fontWeight: 600 }, children: u.username || u.name }), _jsx("div", { style: { fontSize: 12, color: '#666' }, children: u.location || '—' }), _jsxs("div", { style: { marginTop: 6, fontSize: 12 }, children: ["Tags: ", (u.tags || []).join(', ') || '—'] })] }, u._id))) }))] })] }));
};
export default AIDemoPage;

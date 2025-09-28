const API_BASE = '/api/ai';
async function postJson(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        try {
            const data = await res.json();
            throw new Error(data?.error || `Request failed: ${res.status}`);
        }
        catch {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Request failed: ${res.status}`);
        }
    }
    return res.json();
}
function slugify(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
function profileToUser(p) {
    const name = p.name || '';
    const [firstName, ...rest] = String(name).split(/\s+/).filter(Boolean);
    return {
        id: p.id || `p-${Math.random().toString(36).slice(2, 8)}`,
        username: slugify(`${name || 'profile'}-${p.id || ''}`) || `profile-${Date.now()}`,
        firstName: firstName || name || 'User',
        lastName: rest.join(' ') || '',
        bio: p.bio || '',
        areas: Array.isArray(p.interests) ? p.interests : [],
        goals: '',
        experienceLevel: 'unknown',
        location: '',
        createdAt: new Date().toISOString(),
    };
}
export async function getAIStatus() {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok)
        throw new Error(`Status check failed: ${res.status}`);
    return res.json();
}
function normalizeSummary(payload) {
    const raw = payload?.summary ??
        payload?.paragraph ??
        payload?.text ??
        payload?.analysis?.summary ??
        '';
    return String(raw).replace(/\s+/g, ' ').trim();
}
// Heuristic: fallback strings are short and lack sentence punctuation.
export function isLikelyFallbackSummary(s) {
    const text = (s || '').trim();
    if (!text)
        return true;
    const hasPeriod = /[.!?]/.test(text);
    return text.length < 100 || !hasPeriod;
}
export async function analyzeProfile(profile) {
    const modelHint = import.meta?.env?.VITE_GEMINI_MODEL || undefined;
    const debug = import.meta?.env?.VITE_AI_DEBUG === '1';
    const path = debug ? '/analyze?debug=1' : '/analyze';
    const data = await postJson(path, {
        user: profileToUser(profile),
        modelHint,
    });
    const normalized = {
        ...data,
        summary: normalizeSummary(data),
    };
    return normalized;
}
export async function scoreCompatibility(a, b) {
    return postJson('/score', { a: profileToUser(a), b: profileToUser(b) });
}

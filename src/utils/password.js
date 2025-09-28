// Simple password utilities for prototype only. Do NOT use this as-is for production security.
// In real implementation: enforce stronger rules, rate limiting, server-side hashing (e.g., bcrypt/argon2),
// and never store password hashes alongside public profile data.
export function validatePassword(pwd) {
    const issues = [];
    if (pwd.length < 8)
        issues.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd))
        issues.push('One uppercase letter');
    if (!/[a-z]/.test(pwd))
        issues.push('One lowercase letter');
    if (!/[0-9]/.test(pwd))
        issues.push('One number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd))
        issues.push('One special character');
    return issues;
}
export async function hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const CREDS_KEY = 'technova_auth_v1';
export function storeCredentials(creds) {
    try {
        localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
    }
    catch { }
}
export function getStoredCredentials() {
    try {
        const raw = localStorage.getItem(CREDS_KEY);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
// Seed data (replace with API later)
const seedDMs = [
    { id: 'u1', name: 'Alex', type: 'dm', last: 'Hey!' },
    { id: 'u2', name: 'Sam', type: 'dm', last: 'Can you review my PR?' },
];
const seedGroups = [
    { id: 'g1', name: 'Valorant Queens', type: 'group', last: 'Scrim tonight?' },
    { id: 'g2', name: 'Indie Dev Jams', type: 'group', last: 'Theme ideas?' },
];
export default function NotificationsPage() {
    const user = useUserStore(s => s.user);
    const [tab, setTab] = useState('dm');
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState({
        u1: [
            { id: 'm1', from: 'Alex', text: 'Hey!', at: Date.now() - 1000 * 60 * 20 },
            { id: 'm2', from: user?.firstName || 'You', text: 'What’s up?', at: Date.now() - 1000 * 60 * 19 },
        ],
        u2: [{ id: 'm3', from: 'Sam', text: 'Can you review my PR?', at: Date.now() - 1000 * 60 * 60 }],
        g1: [{ id: 'm4', from: 'Maya', text: 'Scrim tonight?', at: Date.now() - 1000 * 60 * 5 }],
        g2: [{ id: 'm5', from: 'Lena', text: 'Theme ideas?', at: Date.now() - 1000 * 60 * 45 }],
    });
    const [draft, setDraft] = useState('');
    const threads = tab === 'dm' ? seedDMs : seedGroups;
    const handleSend = () => {
        if (!selected || !draft.trim())
            return;
        const id = crypto.randomUUID?.() ?? String(Math.random());
        const from = user?.firstName || 'You';
        setMessages(prev => ({
            ...prev,
            [selected.id]: [...(prev[selected.id] || []), { id, from, text: draft.trim(), at: Date.now() }],
        }));
        setDraft('');
    };
    return (_jsxs("div", { className: "grid", style: { gap: '1rem' }, children: [_jsxs("header", { className: "card", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("h2", { children: "Messages & Notifications" }), _jsx("p", { style: { margin: 0 }, children: "DMs and group chats" })] }), _jsx(Link, { to: "/", children: _jsx("button", { children: "Home" }) })] }), _jsxs("div", { className: "grid", style: { gridTemplateColumns: '280px 1fr', gap: '1rem' }, children: [_jsxs("aside", { className: "card", style: { padding: 0 }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid var(--border,#eee)' }, children: [_jsx("button", { onClick: () => setTab('dm'), className: tab === 'dm' ? 'primary' : '', children: "DMs" }), _jsx("button", { onClick: () => setTab('group'), className: tab === 'group' ? 'primary' : '', children: "Groups" })] }), _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0 }, children: threads.map(t => (_jsx("li", { children: _jsxs("button", { style: { width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', background: selected?.id === t.id ? 'var(--surface-2,#f6f6f6)' : 'transparent' }, onClick: () => setSelected(t), children: [_jsx("div", { style: { fontWeight: 600 }, children: t.name }), t.last && _jsx("div", { style: { opacity: 0.7, fontSize: 12, marginTop: 2 }, children: t.last })] }) }, t.id))) })] }), _jsx("main", { className: "card", style: { display: 'flex', flexDirection: 'column' }, children: !selected ? (_jsx("div", { style: { opacity: 0.7, textAlign: 'center', margin: '4rem 0' }, children: "Select a conversation to start chatting." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { borderBottom: '1px solid var(--border,#eee)', paddingBottom: 8, marginBottom: 8 }, children: [_jsx("h3", { style: { margin: 0 }, children: selected.name }), _jsx("div", { style: { fontSize: 12, opacity: 0.7 }, children: selected.type === 'dm' ? 'Direct Message' : 'Group Chat' })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }, children: (messages[selected.id] || []).map(m => (_jsx("div", { style: { alignSelf: m.from === (user?.firstName || 'You') ? 'flex-end' : 'flex-start', maxWidth: '70%' }, children: _jsxs("div", { className: "card", style: { padding: '8px 10px' }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.6, marginBottom: 4 }, children: m.from }), _jsx("div", { children: m.text })] }) }, m.id))) }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 8 }, children: [_jsx("input", { value: draft, onChange: e => setDraft(e.target.value), placeholder: "Type a message\u2026", style: { flex: 1 }, onKeyDown: e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            } }), _jsx("button", { onClick: handleSend, children: "Send" })] })] })) })] })] }));
}

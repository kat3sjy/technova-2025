import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
// Friends are just accepted connections (semantic alias)
export default function FriendsPage() {
    const { user, users, removeConnection } = useUserStore(s => ({
        user: s.user,
        users: s.users,
        removeConnection: s.removeConnection
    }));
    if (!user) {
        return _jsx("div", { className: "card", children: _jsx("p", { children: "Please sign in to view friends." }) });
    }
    const friendUsers = (user.connections || [])
        .map((id) => users.find((u) => u.id === id))
        .filter(Boolean);
    return (_jsxs("div", { className: "grid", style: { gap: '1.25rem' }, children: [_jsxs("header", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("h2", { children: ["Friends (", friendUsers.length, ")"] }), _jsx(Link, { to: "/explore", children: _jsx("button", { children: "Find People" }) })] }), friendUsers.length === 0 && (_jsx("div", { className: "card", children: _jsxs("p", { children: ["No friends yet. Head to ", _jsx(Link, { to: "/explore", children: "Explore" }), " to connect."] }) })), _jsx("div", { className: "grid", style: { gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1rem' }, children: friendUsers.map((f) => (_jsxs("div", { className: "card", style: { display: 'flex', flexDirection: 'column', gap: '.5rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.75rem' }, children: [_jsx("img", { src: f.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(f.username)}`, alt: f.username, style: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' } }), _jsxs("div", { children: [_jsx(Link, { to: `/profile/${f.username}`, style: { textDecoration: 'none' }, children: _jsxs("strong", { children: ["@", f.username] }) }), _jsxs("p", { style: { margin: 0, fontSize: '.6rem', opacity: .6 }, children: [f.firstName, " ", f.lastName] })] })] }), _jsxs("p", { style: { margin: 0, fontSize: '.65rem', opacity: .65 }, children: [f.bio?.slice(0, 70) || 'No bio yet.', (f.bio || '').length > 70 ? '…' : ''] }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '.25rem' }, children: (f.areas || []).slice(0, 3).map((a) => _jsx("span", { className: "badge", style: { fontSize: '.5rem' }, children: a }, a)) }), _jsxs("div", { style: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', gap: '.5rem' }, children: [_jsx(Link, { to: `/profile/${f.username}`, children: _jsx("button", { style: { flex: 1 }, children: "View" }) }), _jsx("button", { style: { background: '#2a3140' }, onClick: () => removeConnection(f.id), children: "Remove" })] })] }, f.id))) })] }));
}

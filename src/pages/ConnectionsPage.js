import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUserStore } from '../store/userStore';
import { Link } from 'react-router-dom';
export default function ConnectionsPage() {
    const { user, users } = useUserStore(s => ({ user: s.user, users: s.users }));
    if (!user) {
        return _jsx("div", { className: "card", children: _jsx("p", { children: "Please sign in to view connections." }) });
    }
    const connections = (user.connections || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
    function mutualCount(other) {
        if (!other)
            return 0;
        const otherConnections = new Set(other.connections || []);
        return (user.connections || []).filter((c) => otherConnections.has(c)).length;
    }
    function mutualList(other) {
        if (!other)
            return [];
        const otherConnections = new Set(other.connections || []);
        return (user.connections || []).filter((c) => otherConnections.has(c));
    }
    return (_jsxs("div", { className: "grid", style: { gap: '1.5rem' }, children: [_jsxs("h2", { children: ["Your Connections (", connections.length, ")"] }), connections.length === 0 && (_jsx("div", { className: "card", children: _jsxs("p", { children: ["No connections yet. Visit ", _jsx(Link, { to: "/explore", children: "Explore" }), " to send requests."] }) })), _jsx("div", { className: "grid", style: { gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }, children: connections.map((c) => {
                    const mutualIds = mutualList(c);
                    const mutualUsers = mutualIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
                    return (_jsxs("div", { className: "card", style: { display: 'flex', flexDirection: 'column', gap: '.5rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.75rem' }, children: [_jsx("img", { src: c.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(c.username)}`, alt: c.username, style: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' } }), _jsxs("div", { children: [_jsx(Link, { to: `/profile/${c.username}`, style: { textDecoration: 'none', color: '#fff' }, children: _jsxs("strong", { children: ["@", c.username] }) }), _jsxs("p", { style: { margin: 0, fontSize: '.65rem', opacity: .6 }, children: [c.firstName, " ", c.lastName] })] })] }), _jsx("p", { style: { margin: 0, fontSize: '.7rem', opacity: .7 }, children: c.location }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '.25rem' }, children: (c.areas || []).slice(0, 3).map((a) => _jsx("span", { className: "badge", style: { fontSize: '.55rem' }, children: a }, a)) }), _jsxs("p", { style: { margin: 0, fontSize: '.65rem', opacity: .55, flexGrow: 1 }, children: [c.bio?.slice(0, 80) || 'No bio yet.', (c.bio || '').length > 80 ? '…' : ''] }), _jsxs("div", { style: { fontSize: '.6rem', opacity: .75 }, children: ["Mutual Connections: ", mutualCount(c), mutualUsers.length > 0 && (_jsxs("div", { style: { marginTop: '.25rem', display: 'flex', flexWrap: 'wrap', gap: '.25rem' }, children: [mutualUsers.slice(0, 4).map((m) => (_jsxs(Link, { to: `/profile/${m.username}`, className: "badge", style: { fontSize: '.5rem', textDecoration: 'none' }, children: ["@", m.username] }, m.id))), mutualUsers.length > 4 && _jsxs("span", { style: { fontSize: '.5rem', opacity: .6 }, children: ["+", mutualUsers.length - 4, " more"] })] }))] }), _jsxs("div", { style: { fontSize: '.6rem', background: '#1e2936', padding: '.35rem .5rem', borderRadius: 4 }, children: ["Contact: ", _jsx("span", { style: { opacity: .85 }, children: c.contact || 'N/A' })] })] }, c.id));
                }) })] }));
}

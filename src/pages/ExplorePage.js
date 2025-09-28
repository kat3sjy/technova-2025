import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
export default function ExplorePage() {
    const user = useUserStore(s => s.user);
    const navigate = useNavigate();
    // Hard redirect if not authenticated (show nothing)
    useEffect(() => {
        if (!user)
            navigate('/login', { replace: true });
    }, [user, navigate]);
    if (!user)
        return null;
    const directory = useUserStore(s => s.users);
    const sendRequest = useUserStore(s => s.sendConnectionRequest);
    const acceptReq = useUserStore(s => s.acceptConnectionRequest);
    const rejectReq = useUserStore(s => s.rejectConnectionRequest);
    const cancelReq = useUserStore(s => s.cancelConnectionRequest);
    const others = (directory || []).filter(u => u.id !== user.id);
    function connectionState(targetId) {
        if (!user)
            return 'none';
        if (user.connections && user.connections.includes(targetId))
            return 'connected';
        if (user.incomingRequests && user.incomingRequests.includes(targetId))
            return 'incoming';
        if (user.outgoingRequests && user.outgoingRequests.includes(targetId))
            return 'outgoing';
        return 'none';
    }
    return (_jsxs("div", { className: "grid", style: { gap: '1rem' }, children: [_jsx("h2", { children: "Explore Members" }), _jsxs("p", { style: { opacity: 0.7, marginBottom: '1.5rem' }, children: ["Welcome, @", user.username, "! Send connection requests to unlock contact info."] }), _jsx("section", { className: "grid", style: { gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }, children: others.map(u => {
                    const state = connectionState(u.id);
                    return (_jsxs("div", { className: "card", style: { display: 'flex', flexDirection: 'column', gap: '.5rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.75rem' }, children: [_jsx("img", { src: u.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.username)}`, alt: u.username, style: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' } }), _jsxs("div", { children: [_jsxs("strong", { children: ["@", u.username] }), _jsxs("p", { style: { margin: 0, fontSize: '.65rem', opacity: .6 }, children: [u.firstName, " ", u.lastName] })] })] }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '.25rem' }, children: (u.areas || []).slice(0, 3).map(a => _jsx("span", { className: "badge", style: { fontSize: '.55rem' }, children: a }, a)) }), _jsx("p", { style: { margin: 0, fontSize: '.7rem', opacity: .7 }, children: u.location }), _jsxs("p", { style: { margin: 0, fontSize: '.65rem', opacity: .55, flexGrow: 1 }, children: [u.bio?.slice(0, 90) || 'No bio yet.', (u.bio || '').length > 90 ? '…' : ''] }), state === 'connected' && (_jsxs("div", { style: { fontSize: '.65rem', background: '#1e2936', padding: '.35rem .5rem', borderRadius: 4 }, children: ["Contact: ", _jsx("span", { style: { opacity: .85 }, children: u.contact || 'N/A' })] })), _jsxs("div", { style: { marginTop: '.25rem' }, children: [state === 'none' && (_jsx("button", { style: { width: '100%' }, onClick: () => sendRequest(u.id), children: "Connect" })), state === 'outgoing' && (_jsx("button", { style: { width: '100%', background: '#222a35' }, onClick: () => cancelReq(u.id), children: "Requested \u2022 Cancel?" })), state === 'incoming' && (_jsxs("div", { style: { display: 'flex', gap: '.5rem' }, children: [_jsx("button", { style: { flex: 1 }, onClick: () => acceptReq(u.id), children: "Accept" }), _jsx("button", { style: { flex: 1, background: '#222a35' }, onClick: () => rejectReq(u.id), children: "Decline" })] })), state === 'connected' && (_jsx("button", { style: { width: '100%', background: '#1e4428', cursor: 'default' }, disabled: true, children: "Connected" }))] })] }, u.id));
                }) }), user.incomingRequests && user.incomingRequests.length > 0 && (_jsxs("section", { style: { marginTop: '2rem' }, children: [_jsx("h3", { children: "Pending Requests" }), _jsx("div", { className: "grid", style: { gap: '.75rem' }, children: user.incomingRequests.map(id => {
                            const reqUser = directory.find(u => u.id === id);
                            if (!reqUser)
                                return null;
                            return (_jsxs("div", { className: "card", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.5rem' }, children: [_jsx("img", { src: reqUser.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(reqUser.username)}`, alt: reqUser.username, style: { width: 32, height: 32, borderRadius: '50%' } }), _jsxs("span", { children: ["@", reqUser.username] })] }), _jsxs("div", { style: { display: 'flex', gap: '.5rem' }, children: [_jsx("button", { style: { fontSize: '.65rem' }, onClick: () => acceptReq(id), children: "Accept" }), _jsx("button", { style: { fontSize: '.65rem', background: '#222a35' }, onClick: () => rejectReq(id), children: "Decline" })] })] }, id));
                        }) })] }))] }));
}

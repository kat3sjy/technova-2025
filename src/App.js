import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConnectionsPage from './pages/ConnectionsPage';
import { UserStoreProvider } from './store/userStore';
import NotificationsPage from './pages/NotificationsPage';
import FriendsPage from './pages/FriendsPage';
import AIDemoPage from './pages/AIDemoPage';
import ChatPage from './pages/Chat';
class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { error: undefined };
    }
    static getDerivedStateFromError(error) { return { error }; }
    componentDidCatch(error, info) { console.error('App error:', error, info); }
    render() {
        if (this.state.error) {
            return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Something went wrong" }), _jsx("pre", { style: { whiteSpace: 'pre-wrap' }, children: String(this.state.error?.message || this.state.error) })] }));
        }
        return this.props.children;
    }
}
export default function App() {
    return (_jsx(UserStoreProvider, { children: _jsx(ErrorBoundary, { children: _jsxs("div", { children: [_jsx(NavBar, {}), _jsx("div", { className: "container", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "/onboarding", element: _jsx(OnboardingPage, {}) }), _jsx(Route, { path: "/profile/:username", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/explore", element: _jsx(ExplorePage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/connections", element: _jsx(ConnectionsPage, {}) }), _jsx(Route, { path: "/notifications", element: _jsx(NotificationsPage, {}) }), _jsx(Route, { path: "/friends", element: _jsx(FriendsPage, {}) }), _jsx(Route, { path: "/ai-demo", element: _jsx(AIDemoPage, {}) }), _jsx(Route, { path: "/chat", element: _jsx(ChatPage, {}) })] }) }), _jsxs("footer", { children: ["\u00A9 ", new Date().getFullYear(), " Ctrl+Femme \u2022 Empowering connection across gaming, tech, and sports"] })] }) }) }));
}
function NavBar() {
    const { user, logout } = useUserStore((s) => ({ user: s.user, logout: s.logout }));
    const navigate = useNavigate();
    const incomingCount = user?.incomingRequests?.length || 0;
    const authedLinks = [
        { to: '/', label: 'HOME' },
        { to: '/connections', label: `CONNECTIONS${incomingCount ? ` (${incomingCount})` : ''}` },
        { to: '/friends', label: 'FRIENDS' },
        { to: '/settings', label: 'SETTINGS' }
    ];
    const publicLinks = [
        { to: '/', label: 'HOME' },
        { to: '/login', label: 'SIGN IN' },
        { to: '/signup', label: 'JOIN NOW' }
    ];
    const links = user ? authedLinks : publicLinks;
    return (_jsxs("nav", { "aria-label": "Main navigation", style: { display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }, children: [_jsx("strong", { style: { marginRight: '2rem', fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }, children: "Ctrl+Femme" }), links.map(l => (_jsx(NavLink, { to: l.to, className: ({ isActive }) => isActive ? 'active' : '', style: { position: 'relative' }, children: l.label }, l.to))), _jsx("span", { style: { flex: 1 } }), user && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx(NavLink, { to: "/chat", className: ({ isActive }) => isActive ? 'active' : '', title: "Chat", children: "\uD83D\uDD14" }), _jsx(NavLink, { to: `/profile/${user.username}`, className: ({ isActive }) => isActive ? 'active' : '', style: {
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff4fa3, #ff9bd2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            textDecoration: 'none'
                        }, title: `Profile: @${user.username}`, children: user.firstName?.charAt(0) || user.username?.charAt(0) || '?' }), _jsx("button", { onClick: () => { logout(); navigate('/'); }, style: { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem', padding: '0.5rem 1rem' }, "aria-label": "Log out", children: "Logout" })] }))] }));
}

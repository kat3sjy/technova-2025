import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import ProfileCard from '../components/ProfileCard';
export default function ProfilePage() {
    const { username } = useParams();
    const current = useUserStore(s => s.user);
    const getUserByUsername = useUserStore(s => s.getUserByUsername);
    const target = username ? getUserByUsername(username) : null;
    if (!target) {
        return _jsx("div", { className: "card", children: _jsx("p", { children: "User profile not found." }) });
    }
    // If not logged in and trying to view someone (including self) require auth first
    if (!current) {
        return (_jsxs("div", { className: "card", style: { maxWidth: 500 }, children: [_jsx("h2", { children: "Sign in to view profiles" }), _jsx("p", { style: { fontSize: '.8rem', opacity: .75 }, children: "Create an account or sign in to view member profiles and connect." }), _jsxs("div", { style: { display: 'flex', gap: '.75rem', marginTop: '1rem' }, children: [_jsx("a", { href: "/login", children: _jsx("button", { children: "Sign In" }) }), _jsx("a", { href: "/signup", children: _jsx("button", { children: "Create Account" }) })] })] }));
    }
    const isSelf = current && current.id === target.id;
    const connected = !!(current && target && current.connections?.includes(target.id));
    return (_jsxs("div", { className: "grid", style: { gap: '1.5rem' }, children: [_jsx(ProfileCard, { user: target }), !isSelf && !connected && (_jsx("div", { className: "card", style: { fontSize: '.75rem', opacity: .75 }, children: "Connection required to view contact details. Send a request from Explore." })), isSelf && (_jsxs("div", { className: "card", style: { fontSize: '.7rem', opacity: .6 }, children: ["This is your profile. Share your handle: @", target.username] })), connected && !isSelf && (_jsxs("div", { className: "card", style: { fontSize: '.75rem' }, children: ["Contact: ", _jsx("strong", { children: target.contact })] }))] }));
}

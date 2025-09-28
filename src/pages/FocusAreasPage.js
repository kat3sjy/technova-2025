import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './home-style.css';
const AREA_OPTIONS = ['Gaming', 'Esports', 'Game Dev', 'Tech Conventions', 'Sports Analytics', 'Sports Performance', 'VR/AR', 'Web Dev'];
export default function FocusAreasPage() {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore();
    const [areas, setAreas] = useState(user?.areas || []);
    const [error, setError] = useState('');
    if (!user)
        return _jsx(Navigate, { to: "/signup", replace: true });
    if (!user.firstName || !user.lastName || !user.country)
        return _jsx(Navigate, { to: "/onboarding/basic-info", replace: true });
    function toggle(area) {
        setAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!areas.length) {
            setError('Select at least one focus area.');
            return;
        }
        setUser({ ...user, areas });
        navigate('/onboarding/experience-goals');
    }
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Your Focus Areas" }), _jsx("p", { className: "hero-description", children: "Pick the topics you want to connect around. You can change these later." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", style: { gap: '1.25rem' }, children: [_jsx("div", { style: { display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }, children: AREA_OPTIONS.map(opt => {
                                    const active = areas.includes(opt);
                                    return (_jsx("button", { type: "button", onClick: () => toggle(opt), "aria-pressed": active, className: "hero-btn", style: {
                                            background: active ? '#ff9bd2' : '#222a35',
                                            color: active ? '#181a1f' : '#d0d9e5',
                                            border: active ? '2px solid #ff4fa3' : '1px solid rgba(255,255,255,0.15)',
                                            fontSize: '.7rem'
                                        }, children: opt }, opt));
                                }) }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "hero-btn", onClick: () => navigate('/onboarding/basic-info'), children: "Back" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: !areas.length, children: "Continue" })] })] })] }) }) }));
}

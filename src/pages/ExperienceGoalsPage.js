import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './home-style.css';
const EXPERIENCE_LEVELS = ['Student', 'Newbie', 'Amateur', 'Intermediate', 'Pro'];
export default function ExperienceGoalsPage() {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore();
    const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || '');
    const [goals, setGoals] = useState(user?.goals || '');
    const [error, setError] = useState('');
    if (!user)
        return _jsx(Navigate, { to: "/signup", replace: true });
    if (!user.firstName || !user.lastName || !user.country)
        return _jsx(Navigate, { to: "/onboarding/basic-info", replace: true });
    if (!user.areas?.length)
        return _jsx(Navigate, { to: "/onboarding/focus-areas", replace: true });
    function handleSubmit(e) {
        e.preventDefault();
        if (!experienceLevel || !goals.trim()) {
            setError('Please fill out both fields.');
            return;
        }
        setUser({ ...user, experienceLevel, goals: goals.trim() });
        navigate('/onboarding/bio-picture');
    }
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Experience & Goals" }), _jsx("p", { className: "hero-description", children: "Share where you are now and what you want out of this community." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Experience Level*" }), _jsxs("select", { className: "form-input", value: experienceLevel, onChange: e => setExperienceLevel(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select..." }), EXPERIENCE_LEVELS.map(l => _jsx("option", { value: l, children: l }, l))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Goals*" }), _jsx("textarea", { className: "form-input", rows: 4, value: goals, onChange: e => setGoals(e.target.value), placeholder: "What do you hope to achieve?", required: true })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "hero-btn", onClick: () => navigate('/onboarding/focus-areas'), children: "Back" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: !experienceLevel || !goals.trim(), children: "Continue" })] })] })] }) }) }));
}

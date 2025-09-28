import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getCountries } from '../utils/locationData';
import "./home-style.css";
export default function BasicInfoPage() {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore();
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        country: user?.country || ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // If not logged in, redirect declaratively (avoids side-effects in render)
    if (!user) {
        return _jsx(Navigate, { to: "/signup", replace: true });
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Validation
            if (!form.firstName.trim()) {
                setError('First name is required.');
                setIsLoading(false);
                return;
            }
            if (!form.lastName.trim()) {
                setError('Last name is required.');
                setIsLoading(false);
                return;
            }
            if (!form.country) {
                setError('Country is required.');
                setIsLoading(false);
                return;
            }
            // Update user with basic info
            const updatedUser = {
                ...user,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                country: form.country,
                location: form.country // Set initial location as country
            };
            setUser(updatedUser);
            // Navigate to next onboarding step
            navigate('/onboarding/focus-areas');
        }
        catch (err) {
            setError('Failed to save information. Please try again.');
        }
        setIsLoading(false);
    }
    const handleBack = () => {
        navigate('/signup');
    };
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Tell us about yourself" }), _jsx("p", { className: "hero-description", children: "Help us personalize your experience by sharing some basic information about yourself." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "First Name*" }), _jsx("input", { type: "text", className: "form-input", value: form.firstName, onChange: (e) => setForm(f => ({ ...f, firstName: e.target.value })), required: true, disabled: isLoading, placeholder: "Enter your first name" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Last Name*" }), _jsx("input", { type: "text", className: "form-input", value: form.lastName, onChange: (e) => setForm(f => ({ ...f, lastName: e.target.value })), required: true, disabled: isLoading, placeholder: "Enter your last name" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Country*" }), _jsxs("select", { className: "form-input", value: form.country, onChange: (e) => setForm(f => ({ ...f, country: e.target.value })), required: true, disabled: isLoading, children: [_jsx("option", { value: "", children: "Select your country" }), getCountries().map(country => (_jsx("option", { value: country, children: country }, country)))] })] }), error && (_jsx("div", { className: "error-message", children: error })), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "hero-btn", onClick: handleBack, disabled: isLoading, children: "Back" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: isLoading, style: { minWidth: '120px' }, children: isLoading ? 'Saving...' : 'Continue' })] })] }), _jsx("div", { className: "auth-switch", children: _jsxs("p", { children: ["Already have an account?", ' ', _jsx("button", { type: "button", className: "auth-link", onClick: () => navigate('/login'), style: { background: 'none', border: 'none', cursor: 'pointer' }, children: "Sign in" })] }) })] }) }) }));
}

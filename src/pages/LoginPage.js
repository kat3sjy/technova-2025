import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { hashPassword, getStoredCredentials } from '../utils/password';
import "./home-style.css";
export default function LoginPage() {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore();
    const [form, setForm] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // If already logged in, redirect to profile
    if (user) {
        navigate(`/profile/${user.username}`);
        return null;
    }
    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const storedCreds = getStoredCredentials();
            if (!storedCreds) {
                setError('No account found. Please create an account first.');
                setIsLoading(false);
                return;
            }
            const enteredUsername = form.username.trim().toLowerCase();
            if (enteredUsername !== storedCreds.username) {
                setError('Invalid username or password.');
                setIsLoading(false);
                return;
            }
            const enteredPasswordHash = await hashPassword(form.password);
            if (enteredPasswordHash !== storedCreds.passwordHash) {
                setError('Invalid username or password.');
                setIsLoading(false);
                return;
            }
            // Login successful - retrieve user data from localStorage
            const userKey = 'technova_user_v1';
            const userData = localStorage.getItem(userKey);
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                navigate('/explore');
            }
            else {
                setError('User profile not found. Please complete onboarding.');
            }
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
        setIsLoading(false);
    }
    const handleBack = () => {
        navigate('/');
    };
    const handleNext = async () => {
        // Use existing login logic
        const event = { preventDefault: () => { } };
        await handleLogin(event);
    };
    const handleHome = () => {
        navigate('/');
    };
    const handleConnections = () => {
        navigate('/explore');
    };
    const handleFriends = () => {
        navigate('/friends');
    };
    const handleSettings = () => {
        navigate('/settings');
    };
    const handleNotifications = () => {
        navigate('/notifications');
    };
    const handleProfile = () => {
        if (user) {
            navigate(`/profile/${user.username}`);
        }
        else {
            navigate('/profile');
        }
    };
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Sign In" }), _jsx("p", { className: "hero-description", children: "Welcome back to Ctrl+Femme! Sign in to connect with your community and continue building meaningful relationships." }), _jsxs("form", { onSubmit: handleLogin, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Username*" }), _jsx("input", { type: "text", className: "form-input", value: form.username, onChange: (e) => setForm(f => ({ ...f, username: e.target.value })), required: true, disabled: isLoading, placeholder: "Enter your username" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password*" }), _jsx("input", { type: "password", className: "form-input", value: form.password, onChange: (e) => setForm(f => ({ ...f, password: e.target.value })), required: true, disabled: isLoading, autoComplete: "current-password", placeholder: "Enter your password" })] }), error && (_jsx("div", { className: "error-message", children: error })), _jsxs("div", { className: "form-actions", children: [_jsx(Link, { to: "/", className: "hero-btn secondary", children: "Back to Home" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: isLoading || !form.username.trim() || !form.password, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "auth-switch", children: _jsxs("p", { children: ["Don't have an account? ", _jsx(Link, { to: "/signup", className: "auth-link", children: "Create one here" })] }) })] })] }) }) }));
}

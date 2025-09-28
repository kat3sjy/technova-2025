import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { validatePassword, hashPassword, storeCredentials, getStoredCredentials } from '../utils/password';
import "./home-style.css";
export default function SignUpPage() {
    const navigate = useNavigate();
    const { users, registerUser } = useUserStore();
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    async function handleSignUp(e) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Validation
            if (!form.username.trim()) {
                setError('Username is required.');
                setIsLoading(false);
                return;
            }
            if (!form.password) {
                setError('Password is required.');
                setIsLoading(false);
                return;
            }
            if (form.password !== form.confirmPassword) {
                setError('Passwords do not match.');
                setIsLoading(false);
                return;
            }
            // Validate password strength
            const passwordIssues = validatePassword(form.password);
            if (passwordIssues.length > 0) {
                setError(`Password requirements: ${passwordIssues.join(', ')}`);
                setIsLoading(false);
                return;
            }
            // Check if username already exists
            const existingCreds = getStoredCredentials();
            if (existingCreds && existingCreds.username === form.username.trim().toLowerCase()) {
                setError('Username already exists. Please choose a different one.');
                setIsLoading(false);
                return;
            }
            // Check if user exists in users array
            const existingUser = users?.find((u) => u.username === form.username.trim().toLowerCase());
            if (existingUser) {
                setError('Username already exists. Please choose a different one.');
                setIsLoading(false);
                return;
            }
            // Hash password and store credentials
            const passwordHash = await hashPassword(form.password);
            storeCredentials({
                username: form.username.trim().toLowerCase(),
                passwordHash,
                createdAt: new Date().toISOString()
            });
            // Create user with basic info (they can complete profile later)
            const newUser = {
                id: crypto.randomUUID(),
                username: form.username.trim().toLowerCase(),
                firstName: '',
                lastName: '',
                country: '', // collected on basic info step
                location: '',
                areas: [],
                experienceLevel: '',
                goals: '',
                bio: '',
                profilePicture: '',
                connections: [],
                incomingRequests: [],
                outgoingRequests: [],
                createdAt: new Date().toISOString()
            }; // cast any to satisfy store typing quickly
            // Register user
            registerUser(newUser);
            // Navigate to first onboarding step (basic info)
            navigate('/onboarding/basic-info');
        }
        catch (err) {
            setError('Sign up failed. Please try again.');
        }
        setIsLoading(false);
    }
    const handleBack = () => {
        navigate('/');
    };
    const handleNext = async () => {
        const event = { preventDefault: () => { } };
        await handleSignUp(event);
    };
    const handleHome = () => {
        navigate('/');
    };
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Join Ctrl+Femme" }), _jsx("p", { className: "hero-description", children: "Create your account and join a community built by diversity. Connect with others who share your passions in gaming, tech, and sports." }), _jsxs("form", { onSubmit: handleSignUp, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Username*" }), _jsx("input", { type: "text", className: "form-input", value: form.username, onChange: (e) => setForm(f => ({ ...f, username: e.target.value })), required: true, disabled: isLoading, placeholder: "Choose a username" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password*" }), _jsx("input", { type: "password", className: "form-input", value: form.password, onChange: (e) => setForm(f => ({ ...f, password: e.target.value })), required: true, disabled: isLoading, autoComplete: "new-password", placeholder: "Create a password" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Confirm Password*" }), _jsx("input", { type: "password", className: "form-input", value: form.confirmPassword, onChange: (e) => setForm(f => ({ ...f, confirmPassword: e.target.value })), required: true, disabled: isLoading, autoComplete: "new-password", placeholder: "Confirm your password" })] }), error && (_jsx("div", { className: "error-message", children: error })), _jsxs("div", { className: "form-actions", children: [_jsx(Link, { to: "/", className: "hero-btn secondary", children: "Back to Home" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: isLoading || !form.username.trim() || !form.password || !form.confirmPassword, children: isLoading ? 'Creating Account...' : 'Create Account' })] }), _jsx("div", { className: "auth-switch", children: _jsxs("p", { children: ["Already have an account? ", _jsx(Link, { to: "/login", className: "auth-link", children: "Sign in here" })] }) })] })] }) }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import './home-style.css';
export default function BioPicturePage() {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore();
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePicture, setProfilePicture] = useState(user?.avatarUrl || '');
    const [imageError, setImageError] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    if (!user)
        return _jsx(Navigate, { to: "/signup", replace: true });
    if (!user.firstName || !user.lastName || !user.country)
        return _jsx(Navigate, { to: "/onboarding/basic-info", replace: true });
    if (!user.areas?.length)
        return _jsx(Navigate, { to: "/onboarding/focus-areas", replace: true });
    if (!user.experienceLevel || !user.goals)
        return _jsx(Navigate, { to: "/onboarding/experience-goals", replace: true });
    async function onImageChange(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const validation = validateImageFile(file);
        if (validation) {
            setImageError(validation);
            return;
        }
        try {
            setImageError('');
            const dataUrl = await handleImageUpload(file);
            setProfilePicture(dataUrl);
        }
        catch (err) {
            setImageError('Upload failed.');
        }
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!bio.trim()) {
            setError('Bio is required.');
            return;
        }
        setSaving(true);
        setUser({ ...user, bio: bio.trim(), avatarUrl: profilePicture });
        navigate('/explore');
    }
    return (_jsx("div", { className: "home-page", children: _jsx("div", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsx("h1", { className: "hero-title", children: "Tell Your Story" }), _jsx("p", { className: "hero-description", children: "Add a short bio and an optional profile picture so others can discover you." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Bio*" }), _jsx("textarea", { className: "form-input", rows: 5, value: bio, onChange: e => setBio(e.target.value), placeholder: "Share your journey, wins, and what you want to learn.", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Profile Picture (Optional)" }), _jsx("input", { type: "file", accept: "image/*", onChange: onImageChange, style: { padding: '.5rem' } }), imageError && _jsx("p", { style: { color: '#ff9bd2', fontSize: '.7rem', margin: 0 }, children: imageError }), profilePicture && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem' }, children: [_jsx("img", { src: profilePicture, alt: "Preview", style: { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' } }), _jsx("button", { type: "button", className: "hero-btn", style: { fontSize: '.65rem' }, onClick: () => setProfilePicture(''), children: "Remove" })] }))] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "hero-btn", onClick: () => navigate('/onboarding/experience-goals'), children: "Back" }), _jsx("button", { type: "submit", className: "hero-btn primary", disabled: !bio.trim() || saving, children: saving ? 'Saving...' : 'Finish' })] })] })] }) }) }));
}

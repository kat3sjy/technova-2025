import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { handleImageUpload, validateImageFile } from '../utils/imageUpload';
import { getCountries, getCities } from '../utils/locationData';
export default function SettingsPage() {
    const { user, setUser, logout } = useUserStore();
    const [imageError, setImageError] = useState('');
    if (!user)
        return _jsx("div", { className: "card", children: _jsx("p", { children: "Login / onboard first." }) });
    function update(field, value) {
        setUser({ ...user, [field]: value });
    }
    // Derive existing country/city from stored location "City, Country" or fallback
    const { initialCountry, initialCity } = useMemo(() => {
        if (!user.location)
            return { initialCountry: '', initialCity: '' };
        const parts = user.location.split(',').map((p) => p.trim());
        if (parts.length === 2)
            return { initialCity: parts[0], initialCountry: parts[1] };
        // If only one part, attempt to classify as country
        return { initialCountry: user.location, initialCity: '' };
    }, [user.location]);
    const [country, setCountry] = useState(initialCountry);
    const [city, setCity] = useState(initialCity);
    function handleCountryChange(val) {
        setCountry(val);
        setCity('');
        const combined = val ? val : '';
        update('location', combined);
    }
    function handleCityChange(val) {
        setCity(val);
        const combined = val ? `${val}, ${country}` : country;
        update('location', combined);
    }
    async function handleImageChange(e) {
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
            setUser({ ...user, avatarUrl: dataUrl });
        }
        catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to upload image');
        }
    }
    return (_jsxs("div", { className: "grid", style: { gap: '1rem', maxWidth: 600 }, children: [_jsx("h2", { children: "Settings" }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Profile Picture" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '.75rem' }, children: [user.avatarUrl && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '.75rem' }, children: [_jsx("img", { src: user.avatarUrl, alt: "Current profile", style: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' } }), _jsx("button", { type: "button", onClick: () => setUser({ ...user, avatarUrl: undefined }), style: { fontSize: '.7rem', padding: '.25rem .5rem' }, children: "Remove Picture" })] })), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, style: { padding: '.5rem' } }), imageError && (_jsx("p", { style: { color: '#ff9bd2', fontSize: '.7rem', margin: 0 }, children: imageError })), _jsx("p", { style: { fontSize: '.65rem', opacity: 0.7, margin: 0 }, children: "Accepted formats: JPG, PNG, GIF. Max size: 5MB" })] })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "First Name" }), _jsx("input", { value: user.firstName, onChange: e => update('firstName', e.target.value) })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Last Name" }), _jsx("input", { value: user.lastName, onChange: e => update('lastName', e.target.value) })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Country" }), _jsxs("select", { value: country, onChange: e => handleCountryChange(e.target.value), children: [_jsx("option", { value: "", children: "Select country..." }), getCountries().map(c => _jsx("option", { value: c, children: c }, c))] })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "State / Province / Region" }), _jsxs("select", { value: city, disabled: !country, onChange: e => handleCityChange(e.target.value), children: [_jsx("option", { value: "", children: country ? 'Select region...' : 'Select country first' }), getCities(country).map(ct => _jsx("option", { value: ct, children: ct }, ct))] })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "Bio" }), _jsx("textarea", { rows: 4, value: user.bio, onChange: e => update('bio', e.target.value) })] }), _jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }, children: _jsx("button", { type: "button", style: { background: '#222a35', color: '#fff' }, onClick: logout, children: "Logout" }) })] })] }));
}

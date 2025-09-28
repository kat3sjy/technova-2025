import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
// Simple decision router that sends the user to the correct onboarding step
export default function OnboardingPage() {
    const { user } = useUserStore();
    if (!user)
        return _jsx(Navigate, { to: "/signup", replace: true });
    if (!user.firstName || !user.lastName || !user.country)
        return _jsx(Navigate, { to: "/onboarding/basic-info", replace: true });
    if (!user.areas?.length)
        return _jsx(Navigate, { to: "/onboarding/focus-areas", replace: true });
    if (!user.experienceLevel || !user.goals)
        return _jsx(Navigate, { to: "/onboarding/experience-goals", replace: true });
    if (!user.bio)
        return _jsx(Navigate, { to: "/onboarding/bio-picture", replace: true });
    return _jsx(Navigate, { to: "/explore", replace: true });
}

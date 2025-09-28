import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
const STORAGE_KEY_SINGLE = 'technova_user_v1'; // legacy single-user key
const STORAGE_KEY_MULTI = 'technova_users_v1';
const useUserBase = create((set, get) => ({
    user: null,
    users: [],
    setUser: (u) => {
        // Update current user in directory
        const state = get();
        const users = state.users.map(ex => ex.id === u.id ? { ...ex, ...u } : ex);
        persist({ users, currentUserId: u.id });
        set({ user: { ...u }, users });
    },
    registerUser: (u) => {
        const state = get();
        const uname = u.username.trim().toLowerCase();
        const exists = state.users.some(ex => ex.username.toLowerCase() === uname);
        if (exists) {
            throw new Error('USERNAME_TAKEN');
        }
        const withDefaults = {
            ...u,
            username: uname,
            connections: u.connections || [],
            incomingRequests: u.incomingRequests || [],
            outgoingRequests: u.outgoingRequests || [],
            contact: u.contact || `${u.username}@example.com`
        };
        const users = [...state.users, withDefaults];
        persist({ users, currentUserId: withDefaults.id });
        set({ users, user: withDefaults });
    },
    clearUser: () => {
        const state = get();
        persist({ users: state.users, currentUserId: null });
        set({ user: null });
    },
    logout: () => {
        const state = get();
        persist({ users: state.users, currentUserId: null });
        set({ user: null });
    },
    sendConnectionRequest: (targetId) => {
        const { user, users } = get();
        if (!user || user.id === targetId)
            return;
        const alreadyConnected = user.connections?.includes(targetId);
        const pending = user.outgoingRequests?.includes(targetId);
        const target = users.find(u => u.id === targetId);
        if (!target)
            return;
        // If target already requested this user, auto-accept (mutual request)
        const targetRequestedAlready = target.outgoingRequests?.includes(user.id) || target.incomingRequests?.includes(user.id);
        let updatedUsers;
        if (targetRequestedAlready) {
            updatedUsers = users.map(u => {
                if (u.id === user.id) {
                    return {
                        ...u,
                        incomingRequests: (u.incomingRequests || []).filter(id => id !== targetId),
                        connections: [...new Set([...(u.connections || []), targetId])],
                        outgoingRequests: (u.outgoingRequests || []).filter(id => id !== targetId)
                    };
                }
                if (u.id === targetId) {
                    return {
                        ...u,
                        incomingRequests: (u.incomingRequests || []).filter(id => id !== user.id),
                        outgoingRequests: (u.outgoingRequests || []).filter(id => id !== user.id),
                        connections: [...new Set([...(u.connections || []), user.id])]
                    };
                }
                return u;
            });
        }
        else {
            if (alreadyConnected || pending)
                return;
            updatedUsers = users.map(u => {
                if (u.id === user.id) {
                    return { ...u, outgoingRequests: [...(u.outgoingRequests || []), targetId] };
                }
                if (u.id === targetId) {
                    return { ...u, incomingRequests: [...(u.incomingRequests || []), user.id] };
                }
                return u;
            });
        }
        persistCurrentUserId(user.id, updatedUsers);
        set({ users: updatedUsers, user: updatedUsers.find(u => u.id === user.id) || null });
    },
    acceptConnectionRequest: (sourceId) => {
        const { user, users } = get();
        if (!user)
            return;
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return {
                    ...u,
                    incomingRequests: (u.incomingRequests || []).filter(id => id !== sourceId),
                    connections: [...new Set([...(u.connections || []), sourceId])]
                };
            }
            if (u.id === sourceId) {
                return {
                    ...u,
                    outgoingRequests: (u.outgoingRequests || []).filter(id => id !== user.id),
                    connections: [...new Set([...(u.connections || []), user.id])]
                };
            }
            return u;
        });
        persistCurrentUserId(user.id, updatedUsers);
        set({ users: updatedUsers, user: updatedUsers.find(u => u.id === user.id) || null });
    },
    rejectConnectionRequest: (sourceId) => {
        const { user, users } = get();
        if (!user)
            return;
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return { ...u, incomingRequests: (u.incomingRequests || []).filter(id => id !== sourceId) };
            }
            if (u.id === sourceId) {
                return { ...u, outgoingRequests: (u.outgoingRequests || []).filter(id => id !== user.id) };
            }
            return u;
        });
        persistCurrentUserId(user.id, updatedUsers);
        set({ users: updatedUsers, user: updatedUsers.find(u => u.id === user.id) || null });
    },
    cancelConnectionRequest: (targetId) => {
        const { user, users } = get();
        if (!user)
            return;
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return { ...u, outgoingRequests: (u.outgoingRequests || []).filter(id => id !== targetId) };
            }
            if (u.id === targetId) {
                return { ...u, incomingRequests: (u.incomingRequests || []).filter(id => id !== user.id) };
            }
            return u;
        });
        persistCurrentUserId(user.id, updatedUsers);
        set({ users: updatedUsers, user: updatedUsers.find(u => u.id === user.id) || null });
    },
    removeConnection: (targetId) => {
        const { user, users } = get();
        if (!user)
            return;
        if (!(user.connections || []).includes(targetId))
            return;
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return { ...u, connections: (u.connections || []).filter(id => id !== targetId) };
            }
            if (u.id === targetId) {
                return { ...u, connections: (u.connections || []).filter(id => id !== user.id) };
            }
            return u;
        });
        persistCurrentUserId(user.id, updatedUsers);
        set({ users: updatedUsers, user: updatedUsers.find(u => u.id === user.id) || null });
    },
    getUserByUsername: (username) => {
        const { users } = get();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },
    isUsernameAvailable: (username) => {
        const { users } = get();
        const uname = username.trim().toLowerCase();
        if (!uname)
            return false;
        return !users.some(u => u.username.toLowerCase() === uname);
    }
}));
function persist(data) {
    try {
        localStorage.setItem(STORAGE_KEY_MULTI, JSON.stringify(data));
    }
    catch { }
}
function persistCurrentUserId(currentUserId, users) {
    persist({ users, currentUserId });
}
const UserStoreContext = createContext(null);
export function UserStoreProvider({ children }) {
    // Hydrate once on mount
    useEffect(() => {
        try {
            // Migration: if multi-user store exists load it, else migrate legacy single user if present
            const multiRaw = localStorage.getItem(STORAGE_KEY_MULTI);
            if (multiRaw) {
                const parsed = JSON.parse(multiRaw);
                if (parsed && Array.isArray(parsed.users)) {
                    let { users, currentUserId } = parsed;
                    // Ensure defaults for connection arrays
                    users = users.map(u => ({
                        ...u,
                        connections: u.connections || [],
                        incomingRequests: u.incomingRequests || [],
                        outgoingRequests: u.outgoingRequests || [],
                        contact: u.contact || `${u.username}@example.com`
                    }));
                    // Seed sample users if only one user exists to allow connecting
                    if (users.length < 2) {
                        const samplesRaw = [
                            {
                                id: 'sample-1', username: 'aisha', firstName: 'Aisha', lastName: 'K', areas: ['Esports'], goals: 'Grow shoutcasting skills',
                                experienceLevel: 'Early Career', bio: 'Caster & community builder.', location: 'Remote', createdAt: new Date().toISOString(),
                                connections: [], incomingRequests: [], outgoingRequests: [], contact: 'aisha@example.com'
                            },
                            {
                                id: 'sample-2', username: 'naomi', firstName: 'Naomi', lastName: 'P', areas: ['VR/AR'], goals: 'Ship immersive prototype',
                                experienceLevel: 'Student', bio: 'VR dev & hackathon fan.', location: 'Seattle', createdAt: new Date().toISOString(),
                                connections: [], incomingRequests: [], outgoingRequests: [], contact: 'naomi@example.com'
                            }
                        ];
                        const existingNames = new Set(users.map(u => u.username.toLowerCase()));
                        const samples = samplesRaw.filter(s => !existingNames.has(s.username.toLowerCase()));
                        users = [...users, ...samples];
                    }
                    persist({ users, currentUserId });
                    const current = users.find(u => u.id === currentUserId) || null;
                    useUserBase.setState({ users, user: current });
                    return;
                }
            }
            const legacyRaw = localStorage.getItem(STORAGE_KEY_SINGLE);
            if (legacyRaw) {
                const legacy = JSON.parse(legacyRaw);
                if (legacy && legacy.id) {
                    const migrated = {
                        ...legacy,
                        connections: [], incomingRequests: [], outgoingRequests: [], contact: `${legacy.username}@example.com`
                    };
                    // seed samples
                    const sampleSeeds = [
                        {
                            id: 'sample-1', username: 'aisha', firstName: 'Aisha', lastName: 'K', areas: ['Esports'], goals: 'Grow shoutcasting skills',
                            experienceLevel: 'Early Career', bio: 'Caster & community builder.', location: 'Remote', createdAt: new Date().toISOString(),
                            connections: [], incomingRequests: [], outgoingRequests: [], contact: 'aisha@example.com'
                        },
                        {
                            id: 'sample-2', username: 'naomi', firstName: 'Naomi', lastName: 'P', areas: ['VR/AR'], goals: 'Ship immersive prototype',
                            experienceLevel: 'Student', bio: 'VR dev & hackathon fan.', location: 'Seattle', createdAt: new Date().toISOString(),
                            connections: [], incomingRequests: [], outgoingRequests: [], contact: 'naomi@example.com'
                        }
                    ];
                    const existingNames = new Set([migrated.username.toLowerCase()]);
                    const filtered = sampleSeeds.filter(s => !existingNames.has(s.username.toLowerCase()));
                    const combined = [migrated, ...filtered];
                    persist({ users: combined, currentUserId: migrated.id });
                    useUserBase.setState({ users: combined, user: migrated });
                }
            }
            else {
                // Initial seed (no users yet) create sample directory only; user remains null until onboarding
                const rawSamples = [
                    {
                        id: 'sample-1', username: 'aisha', firstName: 'Aisha', lastName: 'K', areas: ['Esports'], goals: 'Grow shoutcasting skills',
                        experienceLevel: 'Early Career', bio: 'Caster & community builder.', location: 'Remote', createdAt: new Date().toISOString(),
                        connections: [], incomingRequests: [], outgoingRequests: [], contact: 'aisha@example.com'
                    },
                    {
                        id: 'sample-2', username: 'naomi', firstName: 'Naomi', lastName: 'P', areas: ['VR/AR'], goals: 'Ship immersive prototype',
                        experienceLevel: 'Student', bio: 'VR dev & hackathon fan.', location: 'Seattle', createdAt: new Date().toISOString(),
                        connections: [], incomingRequests: [], outgoingRequests: [], contact: 'naomi@example.com'
                    }
                ];
                const deduped = rawSamples.filter((s, idx, arr) => idx === arr.findIndex(o => o.username.toLowerCase() === s.username.toLowerCase()));
                persist({ users: deduped, currentUserId: null });
                useUserBase.setState({ users: deduped, user: null });
            }
        }
        catch { }
    }, []);
    return _jsx(UserStoreContext.Provider, { value: useUserBase, children: children });
}
export function useUserStore(selector) {
    const store = useContext(UserStoreContext);
    if (!store)
        throw new Error('useUserStore must be used within provider');
    // store is the zustand hook itself (function), so we invoke it with selector or without
    return selector ? store(selector) : store();
}

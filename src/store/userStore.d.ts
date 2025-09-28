export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    areas: string[];
    goals: string;
    experienceLevel: string;
    bio: string;
    location: string;
    country?: string;
    createdAt: string;
    avatarUrl?: string;
    connections?: string[];
    incomingRequests?: string[];
    outgoingRequests?: string[];
    contact?: string;
}
interface UserState {
    user: User | null;
    users: User[];
    setUser: (u: User) => void;
    registerUser: (u: User) => void;
    clearUser: () => void;
    logout: () => void;
    sendConnectionRequest: (targetId: string) => void;
    acceptConnectionRequest: (sourceId: string) => void;
    rejectConnectionRequest: (sourceId: string) => void;
    cancelConnectionRequest: (targetId: string) => void;
    removeConnection: (targetId: string) => void;
    getUserByUsername: (username: string) => User | undefined;
    isUsernameAvailable: (username: string) => boolean;
}
interface ProviderProps {
    children?: any;
}
export declare function UserStoreProvider({ children }: ProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useUserStore<T>(selector?: (s: UserState) => T): T extends undefined ? UserState : T;
export {};

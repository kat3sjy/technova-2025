export declare function validatePassword(pwd: string): string[];
export declare function hashPassword(pwd: string): Promise<string>;
export interface StoredCredentials {
    username: string;
    passwordHash: string;
    createdAt: string;
}
export declare function storeCredentials(creds: StoredCredentials): void;
export declare function getStoredCredentials(): StoredCredentials | null;

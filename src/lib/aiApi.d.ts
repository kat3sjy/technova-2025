import type { Profile, ProfileAnalysis, MatchScore } from '../types/ai';
export type ProfileAnalysis = {
    strengths: string[];
    interests: string[];
    suggestedRoles: string[];
    matchCriteria: string[];
    summary: string;
};
export type AIStatus = {
    configured: boolean;
    model?: string;
    startedAt?: string;
    envModel?: string | null;
    defaultUsed?: boolean;
    cwd?: string;
    lastError?: string | null;
    lastModelUsed?: string | null;
};
export declare function getAIStatus(): Promise<AIStatus>;
export declare function isLikelyFallbackSummary(s: string): boolean;
export declare function analyzeProfile(profile: Profile): Promise<ProfileAnalysis>;
export declare function scoreCompatibility(a: Profile, b: Profile): Promise<MatchScore>;

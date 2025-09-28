import type { ProfileAnalysis, MatchScore } from '../types/ai';
import type { User } from '../store/userStore';
export declare function isAIConfigured(): boolean;
export declare function analyzeProfile(user: User): Promise<ProfileAnalysis>;
export declare function scoreCompatibility(a: User, b: User): Promise<MatchScore>;

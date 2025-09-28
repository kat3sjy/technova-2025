export interface ProfileAnalysis {
    strengths: string[];
    interests: string[];
    suggestedRoles: string[];
    matchCriteria: string[];
    summary: string;
}
export interface MatchScore {
    score: number;
    reasons: string[];
}

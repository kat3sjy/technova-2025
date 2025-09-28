export interface CountryRegions {
    country: string;
    regions: string[];
}
export declare const COUNTRY_REGION_DATA: CountryRegions[];
export declare function getCountries(): string[];
export declare function getRegions(country: string): string[];
export declare const getCities: typeof getRegions;

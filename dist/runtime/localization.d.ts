export declare const availableLocales: string[];
export declare const defaultLocale: string;
export declare function useI18n(locale?: string): {
    t: (key: string) => string;
};
export declare function t(key: string, locale?: string): string;

import { describe, it, expect } from "vitest";
import { useI18n, t, availableLocales, defaultLocale } from "../src/runtime/localization";

describe("Localization", () => {
    describe("constants", () => {
        it("should export available locales", () => {
            expect(availableLocales).toEqual(["en", "de"]);
        });

        it("should export default locale", () => {
            expect(defaultLocale).toBe("de");
        });
    });

    describe("t function", () => {
        it("should return translation for valid key in default locale (de)", () => {
            const result = t("auth.welcomeBack");
            expect(result).toBe("Willkommen zurück");
        });

        it("should return translation for valid key in English", () => {
            const result = t("auth.welcomeBack", "en");
            expect(result).toBe("Welcome Back");
        });

        it("should return translation for nested key", () => {
            const germanResult = t("auth.signInToContinue", "de");
            expect(germanResult).toBe("Melden Sie sich an, um zu Ihrem Konto zu gelangen");

            const englishResult = t("auth.signInToContinue", "en");
            expect(englishResult).toBe("Sign in to continue to your account");
        });

        it("should return key if translation not found", () => {
            const result = t("auth.nonExistentKey");
            expect(result).toBe("auth.nonExistentKey");
        });

        it("should return key if locale not found", () => {
            const result = t("auth.welcomeBack", "fr");
            expect(result).toBe("auth.welcomeBack");
        });

        it("should handle all auth translation keys in German", () => {
            const translations = {
                "auth.welcomeBack": "Willkommen zurück",
                "auth.signInToContinue": "Melden Sie sich an, um zu Ihrem Konto zu gelangen",
                "auth.connecting": "Verbinden...",
                "auth.authenticating": "Authentifizieren...",
                "auth.redirecting": "Weiterleiten...",
                "auth.azureAdDescription": "Wir verbinden Sie sicher mit Azure Active Directory. Das dauert nur einen Moment.",
            };

            for (const [key, expectedValue] of Object.entries(translations)) {
                expect(t(key, "de")).toBe(expectedValue);
            }
        });

        it("should handle all auth translation keys in English", () => {
            const translations = {
                "auth.welcomeBack": "Welcome Back",
                "auth.signInToContinue": "Sign in to continue to your account",
                "auth.connecting": "Connecting...",
                "auth.authenticating": "Authenticating...",
                "auth.redirecting": "Redirecting...",
                "auth.azureAdDescription": "We're securely connecting you to Azure Active Directory. This will only take a moment.",
            };

            for (const [key, expectedValue] of Object.entries(translations)) {
                expect(t(key, "en")).toBe(expectedValue);
            }
        });
    });

    describe("useI18n hook", () => {
        it("should return t function with default locale", () => {
            const { t: tFunc } = useI18n();
            const result = tFunc("auth.welcomeBack");
            expect(result).toBe("Willkommen zurück"); // German as default
        });

        it("should return t function with specified locale", () => {
            const { t: tFunc } = useI18n("en");
            const result = tFunc("auth.welcomeBack");
            expect(result).toBe("Welcome Back");
        });

        it("should handle non-existent keys", () => {
            const { t: tFunc } = useI18n("en");
            const result = tFunc("auth.invalidKey");
            expect(result).toBe("auth.invalidKey");
        });

        it("should work with different locales", () => {
            const germanI18n = useI18n("de");
            const englishI18n = useI18n("en");

            expect(germanI18n.t("auth.connecting")).toBe("Verbinden...");
            expect(englishI18n.t("auth.connecting")).toBe("Connecting...");
        });
    });

    describe("edge cases", () => {
        it("should handle empty string key", () => {
            const result = t("");
            expect(result).toBe("");
        });

        it("should handle undefined locale gracefully", () => {
            const result = t("auth.welcomeBack", undefined as any);
            expect(result).toBe("Willkommen zurück"); // Should use default locale
        });

        it("should handle case sensitivity", () => {
            const result = t("AUTH.WELCOMEBACK"); // Wrong case
            expect(result).toBe("AUTH.WELCOMEBACK"); // Should return key as no match found
        });

        it("should handle deeply nested keys", () => {
            // Test that function correctly handles dot notation
            const result = t("auth.some.deep.key");
            expect(result).toBe("auth.some.deep.key"); // Should return key as no match found
        });
    });
});

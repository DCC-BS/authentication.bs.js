const i18nConfig = {
    legacy: false,
    availableLocales: ["en", "de"],
    locale: "de",
    messages: {
        en: {
            auth: {
                welcomeBack: "Welcome Back",
                signInToContinue: "Sign in to continue to your account",
                connecting: "Connecting...",
                authenticating: "Authenticating...",
                redirecting: "Redirecting...",
                azureAdDescription:
                    "We're securely connecting you to Azure Active Directory. This will only take a moment.",
            },
        },

        de: {
            auth: {
                welcomeBack: "Willkommen zurück",
                signInToContinue:
                    "Melden Sie sich an, um zu Ihrem Konto zu gelangen",
                connecting: "Verbinden...",
                authenticating: "Authentifizieren...",
                redirecting: "Weiterleiten...",
                azureAdDescription:
                    "Wir verbinden Sie sicher mit Azure Active Directory. Das dauert nur einen Moment.",
            },
        },
    },
};

export const availableLocales = i18nConfig.availableLocales;
export const defaultLocale = i18nConfig.locale;

export function useI18n(locale: string = i18nConfig.locale) {
    function _t(key: string): string {
        return t(key, locale);
    }

    return { t: _t };
}

export function t(key: string, locale: string = i18nConfig.locale): string {
    const messages = i18nConfig.messages as unknown as Record<
        string,
        Record<string, unknown>
    >;

    if (!(locale in messages)) {
        console.warn(`Locale "${locale}" not found in messages.`);
        return key;
    }

    console.log(`Translating key "${key}" for locale "${locale}"`);

    // Split the key by dots to support nested object access
    const keyParts = key.split(".");
    let result: unknown = messages[locale];

    // Traverse the nested object structure
    for (const part of keyParts) {
        if (
            result &&
            typeof result === "object" &&
            result !== null &&
            part in result
        ) {
            result = (result as Record<string, unknown>)[part];
        } else {
            // If any part of the path doesn't exist, return the original key
            return key;
        }
    }

    // Return the found value if it's a string, otherwise return the original key
    return typeof result === "string" ? result : key;
}

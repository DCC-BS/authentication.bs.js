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
        azureAdDescription: "We're securely connecting you to Azure Active Directory. This will only take a moment."
      }
    },
    de: {
      auth: {
        welcomeBack: "Willkommen zur\xFCck",
        signInToContinue: "Melden Sie sich an, um zu Ihrem Konto zu gelangen",
        connecting: "Verbinden...",
        authenticating: "Authentifizieren...",
        redirecting: "Weiterleiten...",
        azureAdDescription: "Wir verbinden Sie sicher mit Azure Active Directory. Das dauert nur einen Moment."
      }
    }
  }
};
export const availableLocales = i18nConfig.availableLocales;
export const defaultLocale = i18nConfig.locale;
export function useI18n(locale = i18nConfig.locale) {
  function _t(key) {
    return t(key, locale);
  }
  return { t: _t };
}
export function t(key, locale = i18nConfig.locale) {
  const messages = i18nConfig.messages;
  if (!(locale in messages)) {
    console.warn(`Locale "${locale}" not found in messages.`);
    return key;
  }
  console.log(`Translating key "${key}" for locale "${locale}"`);
  const keyParts = key.split(".");
  let result = messages[locale];
  for (const part of keyParts) {
    if (result && typeof result === "object" && result !== null && part in result) {
      result = result[part];
    } else {
      return key;
    }
  }
  return typeof result === "string" ? result : key;
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
        '@sidebase/nuxt-auth',
        '@nuxtjs/i18n'
    ],
    auth: {
        isEnabled: true,
        globalAppMiddleware: true,
        originEnvKey: "AUTH_ORIGIN",
        provider: {
            type: "authjs",
            defaultProvider: "azureAd",
            addDefaultCallbackUrl: true,
        },
        sessionRefresh: {
            enablePeriodically: 10000,
            enableOnWindowFocus: true,
        },
    },
    i18n: {
        locales: [
            {
                code: "en",
                name: "English",
                file: "en.json",
            },
            {
                code: "de",
                name: "Deutsch",
                file: "de.json",
            },
        ]
    },
    runtimeConfig: {
        azureAdTenantId: process.env.AZURE_AD_TENANT_ID ?? "NA",
        azureAdClientId: process.env.AZURE_AD_CLIENT_ID ?? "NA",
        azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "NA",
        azureAdAPIClientId: process.env.AZURE_AD_API_CLIENT_ID ?? "NA",
        authSecret: process.env.AUTH_SECRET ?? "NA",
    }
})

import {
    addServerHandler,
    addServerImportsDir,
    addServerScanDir,
    createResolver,
    defineNuxtModule,
    extendPages,
    installModule,
} from "@nuxt/kit";

export default defineNuxtModule({
    meta: {
        name: "authentication.bs.js",
        configKey: "authentication.bs.js",
    },
    // Default configuration options of the Nuxt module
    defaults: {},
    async setup(_options, nuxt) {
        const resolver = createResolver(import.meta.url);

        // Set runtime configuration
        nuxt.options.runtimeConfig = {
            ...nuxt.options.runtimeConfig,
            azureAdTenantId: process.env.AZURE_AD_TENANT_ID,
            azureAdClientId: process.env.AZURE_AD_CLIENT_ID,
            azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            apiUrl: process.env.API_URL,
            authSecret: process.env.NUXT_AUTH_SECRET,
            githubToken: process.env.GITHUB_TOKEN,
        };

        extendPages((pages) => {
            pages.unshift({
                name: "auth-signin",
                path: "/auth/signin",
                file: resolver.resolve("./runtime/pages/auth/signIn.vue"),
            });
        });

        addServerScanDir(resolver.resolve("./runtime/server"));

        // addServerImportsDir(resolver.resolve("./runtime/server/utils"));

        // // Add server API handlers
        // addServerHandler({
        //     route: "/api/auth/**",
        //     handler: resolver.resolve("./runtime/server/api/auth/[...]"),
        // });

        await installModule("@sidebase/nuxt-auth", {
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
        });

        // examples:
        // addImportsDir(resolver.resolve('./runtime/composables'));
        // addTypeTemplate({ filename: 'types/commands.d.ts', src: resolver.resolve('./runtime/models/commands.d.ts') });
    },
});

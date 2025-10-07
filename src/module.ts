import {
    addImportsDir,
    addServerScanDir,
    createResolver,
    defineNuxtModule,
    extendPages,
    installModule,
    resolveAlias,
} from "@nuxt/kit";

interface ModuleOptions {
    isEnabled?: boolean;
    useDummy: boolean;
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "authentication.bs.js",
        configKey: "authentication.bs.js",
    },
    defaults: { isEnabled: true },
    async setup(_options, nuxt) {
        if (_options.isEnabled === false) {
            return;
        }

        const resolver = createResolver(import.meta.url);

        // Set runtime configuration
        nuxt.options.runtimeConfig = {
            ...nuxt.options.runtimeConfig,
            azureAdTenantId: process.env.AZURE_AD_TENANT_ID ?? "NA",
            azureAdClientId: process.env.AZURE_AD_CLIENT_ID ?? "NA",
            azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "NA",
            azureAdAPIClientId: process.env.AZURE_AD_API_CLIENT_ID ?? "NA",
            authSecret: process.env.AUTH_SECRET ?? "NA",
        };

        addServerScanDir(resolver.resolve("./runtime/server"));

        if (_options.useDummy === true) {
            addImportsDir(resolver.resolve("./runtime/dummy-composables"));
            nuxt.options.alias["#auth"] = resolveAlias(
                resolver.resolve("./runtime/dummy-composables"),
            );
            return;
        }

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

        extendPages((pages) => {
            pages.unshift({
                name: "auth-signin",
                path: "/auth/signin",
                file: resolver.resolve("./runtime/pages/auth/signIn.vue"),
                meta: {
                    auth: {
                        unauthenticatedOnly: true,
                        navigateAuthenticatedTo: "/",
                    },
                    layout: "auth",
                },
            });
        });
    },
});

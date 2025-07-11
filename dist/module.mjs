import { defineNuxtModule, createResolver, extendPages, addServerScanDir, installModule } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "authentication.bs.js",
    configKey: "authentication.bs.js"
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.runtimeConfig = {
      ...nuxt.options.runtimeConfig,
      azureAdTenantId: process.env.AZURE_AD_TENANT_ID,
      azureAdClientId: process.env.AZURE_AD_CLIENT_ID,
      azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      authSecret: process.env.NUXT_AUTH_SECRET,
      githubToken: process.env.GITHUB_TOKEN
    };
    extendPages((pages) => {
      pages.unshift({
        name: "auth-signin",
        path: "/auth/signin",
        file: resolver.resolve("./runtime/pages/auth/signIn.vue"),
        meta: {
          auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
          layout: "auth"
        }
      });
    });
    addServerScanDir(resolver.resolve("./runtime/server"));
    await installModule("@sidebase/nuxt-auth", {
      isEnabled: true,
      globalAppMiddleware: true,
      originEnvKey: "AUTH_ORIGIN",
      provider: {
        type: "authjs",
        defaultProvider: "azureAd",
        addDefaultCallbackUrl: true
      },
      sessionRefresh: {
        enablePeriodically: 1e4,
        enableOnWindowFocus: true
      }
    });
  }
});

export { module as default };

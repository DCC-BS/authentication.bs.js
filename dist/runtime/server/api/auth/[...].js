import AzureADProvider from "next-auth/providers/azure-ad";
import { NuxtAuthHandler } from "#auth";
import { useRuntimeConfig } from "#imports";
export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    AzureADProvider.default({
      clientId: useRuntimeConfig().azureAdClientId,
      clientSecret: useRuntimeConfig().azureAdClientSecret,
      tenantId: useRuntimeConfig().azureAdTenantId,
      authorization: {
        params: {
          scope: "openid email profile User.Read"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      const extendedToken = token;
      if (account && profile) {
        extendedToken.accessToken = account.access_token;
        extendedToken.refreshToken = account.refresh_token;
      }
      return extendedToken;
    }
  }
});

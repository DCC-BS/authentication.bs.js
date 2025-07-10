import AzureADProvider from "next-auth/providers/azure-ad";
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
        extendedToken.idToken = account.id_token;
        extendedToken.accessToken = account.access_token;
        extendedToken.refreshToken = account.refresh_token;
        extendedToken.provider = account.provider;
        const azureProfile = profile;
        extendedToken.sub = azureProfile.sub || azureProfile.oid;
        extendedToken.email = azureProfile.email;
        extendedToken.name = azureProfile.name;
        extendedToken.roles = azureProfile.roles || [];
        console.log("JWT Token:", extendedToken);
        return extendedToken;
      }
      return {
        ...extendedToken,
        error: "RefreshAccessTokenError"
      };
    }
  }
});

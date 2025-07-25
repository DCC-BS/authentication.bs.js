import AzureADProvider from "next-auth/providers/azure-ad";
import { NuxtAuthHandler } from "#auth";
import { useRuntimeConfig } from "#imports";
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
async function getApiAccessToken(refreshToken) {
  const config = useRuntimeConfig();
  const url = `https://login.microsoftonline.com/${config.azureAdTenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.azureAdClientId,
    client_secret: config.azureAdClientSecret,
    scope: `api://${config.azureAdAPIClientId}/user_impersonation`
  });
  const response = await $fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  if (!response.access_token) {
    throw new Error("Failed to get API access token");
  }
  return response.access_token;
}
export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    AzureADProvider.default({
      clientId: useRuntimeConfig().azureAdClientId,
      clientSecret: useRuntimeConfig().azureAdClientSecret,
      tenantId: useRuntimeConfig().azureAdTenantId,
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read"
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
        extendedToken.idToken = account.id_token;
      }
      return extendedToken;
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      const currentTimeInSeconds = Math.floor(Date.now() / 1e3);
      const tokenExpired = !session.apiAccessTokenExpiresAt || session.apiAccessTokenExpiresAt <= currentTimeInSeconds;
      if (!session.apiAccessToken || tokenExpired) {
        session.apiAccessToken = await getApiAccessToken(token.refreshToken);
        const decoded = decodeJWT(session.apiAccessToken);
        session.apiAccessTokenExpiresAt = decoded.exp;
        session.user.roles = decoded.roles;
      }
      return session;
    }
  }
});

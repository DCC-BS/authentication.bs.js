import { useRuntimeConfig } from "#imports";

export async function getApiAccessToken(refreshToken: unknown) {
    const config = useRuntimeConfig();
    const url = `https://login.microsoftonline.com/${config.azureAdTenantId}/oauth2/v2.0/token`;
    const body = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.azureAdClientId,
        client_secret: config.azureAdClientSecret,
        scope: `api://${config.azureAdAPIClientId}/user_impersonation`,
    }
    const response = await $fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    });
    const data = await response.json();
    if (!data.access_token) {
        throw new Error("Failed to get API access token");
    }
    return data.access_token;
}
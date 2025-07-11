declare module "#auth" {
    import type { H3Event } from "h3";
    import type { JWT } from "next-auth/jwt";
    import type { Session, AuthOptions } from "next-auth";

    /**
     * Extended session type that may include error information for token refresh failures
     */
    export interface ExtendedSession extends Session {
        error?: string;
    }

    /**
     * Extended JWT type that includes optional idToken for backend authentication
     */
    export interface ExtendedJWT extends JWT {
        idToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        provider?: string;
    }

    /**
     * Options for getting token from request
     */
    export interface GetTokenOptions {
        event: H3Event;
        secret?: string;
        secureCookie?: boolean;
        salt?: string;
    }

    /**
     * Get the server-side session for the current request
     * @param event - The H3 event object from the request
     * @returns Promise resolving to the session or null if not authenticated
     */
    export function getServerSession(
        event: H3Event,
    ): Promise<ExtendedSession | null>;

    /**
     * Get the JWT token for the current request
     * @param options - Configuration options including the H3 event
     * @returns Promise resolving to the JWT token or null if not found
     */
    export function getToken(
        options: GetTokenOptions,
    ): Promise<ExtendedJWT | null>;

    /**
     * Nuxt Auth Handler for creating authentication endpoints
     */
    export function NuxtAuthHandler(nuxtAuthOptions?: AuthOptions);
}

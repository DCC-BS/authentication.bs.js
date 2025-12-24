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

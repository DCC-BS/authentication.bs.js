import {
    createError,
    defineEventHandler,
    type EventHandler,
    type EventHandlerRequest,
    type H3Event,
} from "h3";
import type { ExtendedJWT, ExtendedSession } from "#auth";
import { getServerSession, getToken } from "#auth";
import { useRuntimeConfig } from "#imports";
import {
    type BackendHandler,
    type BodyProvider,
    defaultFetcher,
    defaultHandler,
    type Fetcher,
    getDefaultBodyProvider,
} from "../models";

/**
 * Default configuration options for backend handler
 */
const defaultOptions = {
    method: "GET" as const,
    handler: defaultHandler,
    fetcher: defaultFetcher,
};

/**
 * Creates a Nuxt server event handler that proxies requests to a backend API with authentication
 *
 * This utility function handles:
 * - Authentication token extraction and validation
 * - Session management with refresh token error handling
 * - Request body processing
 * - Backend API communication with proper headers
 * - Response transformation
 * - Error handling
 *
 * @template TRequest - The type of the incoming request event
 * @template TBody - The type of the request body
 * @template TBackendResponse - The type of response expected from the backend API
 * @template TResponse - The final response type returned to the client (defaults to TBackendResponse)
 *
 * @param options - Configuration object for the handler
 * @param options.url - The backend API endpoint URL (relative to the configured API base URL)
 * @param options.method - HTTP method to use (defaults to "POST")
 * @param options.bodyProvider - Function to extract the request body (defaults to readBody)
 * @param options.handler - Function to transform the backend response (defaults to pass-through)
 * @param options.fetcher - Function to make HTTP requests (defaults to $fetch)
 *
 * @returns An H3 event handler that can be used in Nuxt server routes
 *
 * @throws {401} When user is not authenticated or token refresh fails
 *
 * @example
 * ```typescript
 * // Simple POST request handler
 * export default defineBackendHandler({
 *   url: "correct",
 * });
 *
 * // GET request with custom response transformation
 * export default defineBackendHandler<{}, unknown, BackendUser[], User[]>({
 *   url: "users",
 *   method: "GET",
 *   handler: async (backendUsers) => backendUsers.map(transformUser),
 * });
 * ```
 */
export const defineBackendHandler = <
    TRequest extends EventHandlerRequest = EventHandlerRequest,
    TBody = unknown,
    TBackendResponse = unknown,
    TResponse = TBackendResponse,
>(options: {
    url: string;
    method?: "POST" | "GET" | "PUT" | "DELETE";
    bodyProvider?: BodyProvider<TRequest, TBody>;
    handler?: BackendHandler<TBackendResponse, TResponse>;
    fetcher?: Fetcher<TBody, TBackendResponse>;
}): EventHandler<TRequest, Promise<TResponse>> =>
    defineEventHandler<TRequest>(async (event: H3Event) => {
        try {
            // Merge provided options with defaults
            const { url, method, bodyProvider, handler, fetcher } = {
                ...defaultOptions,
                ...{
                    bodyProvider: getDefaultBodyProvider<TRequest, TBody>(
                        options.method,
                    ),
                },
                ...options,
            };

            // Get runtime configuration for API base URL
            const config = useRuntimeConfig();

            // Extract request body using the configured body provider
            const body = await bodyProvider(event);

            // Get authentication session and token
            const session = await getServerSession(event);
            const token = (await getToken({
                event,
            })) as ExtendedJWT | undefined;

            // Check for session error (token refresh failed)
            // This happens when refresh tokens expire or become invalid
            if (
                (session as ExtendedSession)?.error ===
                "RefreshAccessTokenError"
            ) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Token Refresh Failed",
                    message:
                        "Authentication tokens have expired and could not be refreshed. Please sign in again.",
                });
            }

            // Ensure user is authenticated
            if (!session || !token) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message: "You must be logged in to access this resource.",
                });
            }

            if (!("apiAccessToken" in session)) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message: "You must be logged in to access this resource.",
                });
            }

            // Extract access token for backend authentication
            const apiAccessToken = session?.apiAccessToken;

            // Make authenticated request to backend API using the configured fetcher
            const backendResponse = await fetcher({
                url: `${config.apiUrl}${url}`,
                method,
                body,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: apiAccessToken
                        ? `Bearer ${apiAccessToken}`
                        : "",
                },
                event,
            });

            // Transform the backend response using the configured handler
            return await handler(backendResponse as TBackendResponse);
        } catch (err: unknown) {
            let errorMessage = "An unexpected error occurred";
            let errorCode = 500;
            let statusMessage = "Backend Communication Error";

            if (typeof err === "string") {
                errorMessage = err;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            if (typeof err === "object" && err && "statusCode" in err) {
                if ("statusCode" in err) {
                    errorCode = err.statusCode as number;
                }
                if ("statusMessage" in err) {
                    statusMessage = err.statusMessage as string;
                }
            }

            // preserve error structure for client
            if (err && typeof err === "object" && "statusCode" in err) {
                throw createError({
                    statusCode: errorCode,
                    statusMessage: statusMessage,
                    message: errorMessage,
                    data: { originalError: err },
                });
            }

            // Wrap other errors in a consistent format
            throw createError({
                statusCode: 500,
                statusMessage: "Backend Communication Error",
                message:
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred",
                data: { originalError: err },
            });
        }
    });

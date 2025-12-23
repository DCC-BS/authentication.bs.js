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

declare module "#imports" {
    export interface PageMeta {
        [key: string]: unknown;
        /**
         * Validate whether a given route can validly be rendered with this page.
         *
         * Return true if it is valid, or false if not. If another match can't be found,
         * this will mean a 404. You can also directly return an object with
         * statusCode/statusMessage to respond immediately with an error (other matches
         * will not be checked).
         */
        validate?: (
            route: RouteLocationNormalized,
        ) =>
            | boolean
            | Partial<NuxtError>
            | Promise<boolean | Partial<NuxtError>>;
        /**
         * Where to redirect if the route is directly matched. The redirection happens
         * before any navigation guard and triggers a new navigation with the new
         * target location.
         */
        redirect?: RouteRecordRedirectOption;
        /**
         * Aliases for the record. Allows defining extra paths that will behave like a
         * copy of the record. Allows having paths shorthands like `/users/:id` and
         * `/u/:id`. All `alias` and `path` values must share the same params.
         */
        alias?: string | string[];
        pageTransition?: boolean | TransitionProps;
        layoutTransition?: boolean | TransitionProps;
        key?:
            | false
            | string
            | ((route: RouteLocationNormalizedLoaded) => string);
        keepalive?: boolean | KeepAliveProps;
        /** You may define a name for this page's route. */
        name?: string;
        /** You may define a path matcher, if you have a more complex pattern than can be expressed with the file name. */
        path?: string;
        /**
         * Allows accessing the route `params` as props passed to the page component.
         * @see https://router.vuejs.org/guide/essentials/passing-props
         */
        props?: RouteRecordRaw["props"];
        /** Set to `false` to avoid scrolling to top on page navigations */
        scrollToTop?:
            | boolean
            | ((
                  to: RouteLocationNormalizedLoaded,
                  from: RouteLocationNormalizedLoaded,
              ) => boolean);
    }

    import type { RouterMethod } from "h3";

    export function useAuth(): {
        signIn: (path?: string, method?: RouterMethod) => Promise<void>;
    };

    export function definePageMeta(meta: PageMeta): void;
}

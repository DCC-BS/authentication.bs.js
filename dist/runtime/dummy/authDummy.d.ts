import type { getServerSession as originalGetServerSession, getToken as originalGetToken } from "@sidebase/nuxt-auth/dist/runtime/server/services/";
import type { ProviderAuthjs } from "@sidebase/nuxt-auth/dist/runtime/types";
export declare const getServerSession: typeof originalGetServerSession;
export declare const getToken: typeof originalGetToken;
export declare function useAuth(): {
    status: string;
    data: any;
    lastRefreshedAt: Date | undefined;
    getCsrfToken: () => string;
    getProviders: () => ProviderAuthjs[];
    getSession: GetSessionFunc<SessionData>;
    signIn: SignInFunc;
    signOut: SignOutFunc;
};

import type { ProviderAuthjs } from "@sidebase/nuxt-auth/dist/runtime/types";
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

import type { SignInFunc, SignOutFunc } from "@sidebase/nuxt-auth/dist/runtime/composables/authjs/useAuth";
import type { SessionData } from "@sidebase/nuxt-auth/dist/runtime/composables/authjs/useAuthState";
import type { GetSessionFunc, ProviderAuthjs } from "@sidebase/nuxt-auth/dist/runtime/types";


export function useAuth(){

    const status = 'unauthenticated';
    const data = undefined as SessionData | undefined;
    const lastRefreshedAt = undefined as Date | undefined;
    
    function getCsrfToken(){
        return 'dummy';
    }

    function getProviders(){
        return [] as ProviderAuthjs[];
    }

    const getSession: GetSessionFunc<SessionData> = (_) => {
        return Promise.resolve({} as SessionData);
    }

    const signIn: SignInFunc = (_, __, ___, ____) => {
        return Promise.resolve({ error: null, status: 200, ok: true, url: '/auth/signin' });
    };

    const signOut: SignOutFunc = (_) => {
        return Promise.resolve(undefined);
    }

    return {
        status,
        data,
        lastRefreshedAt,
        getCsrfToken,
        getProviders,
        getSession,
        signIn,
        signOut
    }
}
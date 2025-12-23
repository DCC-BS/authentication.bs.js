import type {
    GetProvidersResult,
    useAuth as originalUseAuth,
    SignInFunc,
    SignOutFunc,
} from "@sidebase/nuxt-auth/dist/runtime/composables/authjs/useAuth";
import type { SessionData } from "@sidebase/nuxt-auth/dist/runtime/composables/authjs/useAuthState";
import type {
    getServerSession as originalGetServerSession,
    getToken as originalGetToken,
} from "@sidebase/nuxt-auth/dist/runtime/server/services/";
import type {
    GetSessionFunc,
    SessionStatus,
} from "@sidebase/nuxt-auth/dist/runtime/types";
import { computed, ref } from "vue";

export const getServerSession: typeof originalGetServerSession = (_) => {
    return Promise.resolve(null);
};

export const getToken: typeof originalGetToken = (_) => {
    return Promise.resolve(null);
};

export const useAuth: typeof originalUseAuth = () => {
    const status = computed(() => "unauthenticated" as SessionStatus);
    const data = ref(undefined as SessionData | undefined);
    const lastRefreshedAt = ref(undefined as Date | undefined);

    function getCsrfToken() {
        return Promise.resolve("dummy");
    }

    function getProviders() {
        return Promise.resolve({} as GetProvidersResult);
    }

    const getSession: GetSessionFunc<SessionData> = (_) => {
        return Promise.resolve({} as SessionData);
    };

    const signIn: SignInFunc = (_, __, ___, ____) => {
        return Promise.resolve({
            error: null,
            status: 200,
            ok: true,
            url: "/auth/signin",
        });
    };

    const signOut: SignOutFunc = (_) => {
        return Promise.resolve(undefined);
    };

    return {
        status,
        data,
        lastRefreshedAt,
        getCsrfToken,
        getProviders,
        getSession,
        signIn,
        signOut,
        refresh: () => Promise.resolve(),
    };
};

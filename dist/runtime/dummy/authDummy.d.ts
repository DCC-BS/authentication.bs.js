import type { useAuth as originalUseAuth } from "@sidebase/nuxt-auth/dist/runtime/composables/authjs/useAuth";
import type { getServerSession as originalGetServerSession, getToken as originalGetToken } from "@sidebase/nuxt-auth/dist/runtime/server/services/";
export declare const getServerSession: typeof originalGetServerSession;
export declare const getToken: typeof originalGetToken;
export declare const useAuth: typeof originalUseAuth;

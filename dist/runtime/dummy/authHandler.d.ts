import type { NuxtAuthHandler as OriginalNuxtAuthHandler } from "@sidebase/nuxt-auth/dist/runtime/server/services/authjs/nuxtAuthHandler";
type AuthType = typeof OriginalNuxtAuthHandler;
export declare const NuxtAuthHandler: AuthType;
export {};

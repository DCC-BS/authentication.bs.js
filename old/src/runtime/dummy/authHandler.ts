import type { NuxtAuthHandler as OriginalNuxtAuthHandler } from "@sidebase/nuxt-auth/dist/runtime/server/services/authjs/nuxtAuthHandler";
import { createError, eventHandler, sendError } from "h3";

type AuthType = typeof OriginalNuxtAuthHandler;

export const NuxtAuthHandler: AuthType = (_) => {
    return eventHandler(async (event) => {
        return sendError(
            event,
            createError({
                statusCode: 501,
                statusMessage: "Not Implemented - Dummy Auth Handler",
            }),
        );
    });
};

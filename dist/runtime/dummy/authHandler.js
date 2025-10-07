import { createError, eventHandler, sendError } from "h3";
export const NuxtAuthHandler = (_) => {
  return eventHandler(async (event) => {
    return sendError(
      event,
      createError({
        statusCode: 501,
        statusMessage: "Not Implemented - Dummy Auth Handler"
      })
    );
  });
};

import { createError, defineEventHandler, readBody } from "h3";
import { getServerSession, getToken } from "#auth";
async function extractEventBody(event) {
  return readBody(event);
}
export async function noBody(_) {
  return void 0;
}
export async function defaultHandler(response) {
  return response;
}
export async function defaultFetcher(url, method, body, headers) {
  return await $fetch(url, {
    method,
    body: JSON.stringify(body),
    headers
  });
}
const defaultOptions = {
  method: "GET",
  handler: defaultHandler,
  fetcher: defaultFetcher
};
function getDefaultBodyProvider(method) {
  switch (method) {
    case void 0:
      return noBody;
    case "GET":
    case "DELETE":
      return noBody;
    default:
      return extractEventBody;
  }
}
export const defineBackendHandler = (options) => defineEventHandler(async (event) => {
  try {
    const { url, method, bodyProvider, handler, fetcher } = {
      ...defaultOptions,
      ...{ bodyProvider: getDefaultBodyProvider(options.method) },
      ...options
    };
    const config = useRuntimeConfig();
    const body = await bodyProvider(event);
    const session = await getServerSession(event);
    const token = await getToken({
      event
    });
    if (session?.error === "RefreshAccessTokenError") {
      throw createError({
        statusCode: 401,
        statusMessage: "Token Refresh Failed",
        message: "Authentication tokens have expired and could not be refreshed. Please sign in again."
      });
    }
    if (!session && !token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to access this resource."
      });
    }
    const idToken = token?.idToken;
    const backendResponse = await fetcher(
      `${config.apiUrl}${url}`,
      method,
      body,
      {
        "Content-Type": "application/json",
        Authorization: idToken ? `Bearer ${idToken}` : "",
        "X-Access-Token": token ? JSON.stringify(token) : ""
      }
    );
    return await handler(backendResponse);
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Backend Communication Error",
      message: err instanceof Error ? err.message : "An unexpected error occurred",
      data: { originalError: err }
    });
  }
});

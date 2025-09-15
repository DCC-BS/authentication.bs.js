import {
  defineEventHandler
} from "h3";
import { getServerSession, getToken } from "#auth";
import { useRuntimeConfig } from "#imports";
import {
  defaultFetcher,
  defaultHandler,
  getDefaultBodyProvider
} from "../models/index.js";
const defaultOptions = {
  method: "GET",
  handler: defaultHandler,
  fetcher: defaultFetcher
};
export const defineBackendHandler = (options) => defineEventHandler(async (event) => {
  try {
    const { url, method, bodyProvider, handler, fetcher } = {
      ...defaultOptions,
      ...{
        bodyProvider: getDefaultBodyProvider(
          options.method
        )
      },
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
    if (!session || !token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to access this resource."
      });
    }
    if (!("apiAccessToken" in session)) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to access this resource."
      });
    }
    const apiAccessToken = session?.apiAccessToken;
    const backendResponse = await fetcher({
      url: `${config.apiUrl}/${url}`,
      method,
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiAccessToken ? `Bearer ${apiAccessToken}` : ""
      },
      event
    });
    return await handler(backendResponse);
  } catch (err) {
    let errorMessage = "An unexpected error occurred";
    let errorCode = 500;
    let statusMessage = "Backend Communication Error";
    if (typeof err === "string") {
      errorMessage = err;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    if (typeof err === "object" && err && "statusCode" in err) {
      if ("statusCode" in err) {
        errorCode = err.statusCode;
      }
      if ("statusMessage" in err) {
        statusMessage = err.statusMessage;
      }
    }
    if (err && typeof err === "object" && "statusCode" in err) {
      throw createError({
        statusCode: errorCode,
        statusMessage,
        message: errorMessage,
        data: { originalError: err }
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Backend Communication Error",
      message: err instanceof Error ? err.message : "An unexpected error occurred",
      data: { originalError: err }
    });
  }
});

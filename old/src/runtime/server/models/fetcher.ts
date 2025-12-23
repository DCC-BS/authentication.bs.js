import type { H3Event } from "h3";
import { getAbortSignal } from "../utils/abort_handler";

export type FetcherOptions<TBody> = {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    body: TBody;
    headers: Record<string, string>;
    event: H3Event;
};

/**
 * Function type for making HTTP requests to the backend
 * @template T - The response type from the backend
 */
export type Fetcher<TBody, TResponse> = (
    options: FetcherOptions<TBody>,
) => Promise<TResponse>;

/**
 * Default fetcher that uses Nuxt's $fetch utility
 * @template T - The response type from the backend
 * @param url - The full URL to fetch from
 * @param method - HTTP method to use
 * @param body - Request body (will be JSON stringified)
 * @param headers - HTTP headers to include
 * @returns Promise resolving to the backend response
 */
export async function defaultFetcher<T>(
    options: FetcherOptions<T>,
): Promise<T> {
    const { url, method, body, headers, event } = options;

    const signal = getAbortSignal(event);

    return await $fetch(url, {
        method,
        body: JSON.stringify(body),
        headers,
        signal: signal,
    });
}

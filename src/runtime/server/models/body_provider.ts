import type { EventHandlerRequest, H3Event } from "h3";
import { readBody } from "h3";

/**
 * Function type for extracting the request body from an H3 event
 * @template TIn - The event handler request type
 * @template TBody - The expected body type
 */ useRuntimeConfig;
export type BodyProvider<TIn extends EventHandlerRequest, TBody> = (
    event: H3Event<TIn>,
) => Promise<TBody>;

/**
 * Default body provider that extracts and parses the request body using H3's readBody
 * @template TRequest - The event handler request type
 * @template TBody - The expected body type
 * @param event - The H3 event object
 * @returns Promise resolving to the parsed request body
 */
export async function extractEventBody<
    TRequest extends EventHandlerRequest,
    TBody,
>(event: H3Event<TRequest>): Promise<TBody> {
    return readBody<TBody>(event);
}

export async function noBody<TRequest extends EventHandlerRequest>(
    _: H3Event<TRequest>,
): Promise<undefined> {
    return undefined;
}

export function getDefaultBodyProvider<
    TRequest extends EventHandlerRequest,
    TBody,
>(method?: "GET" | "POST" | "PUT" | "DELETE"): BodyProvider<TRequest, TBody> {
    switch (method) {
        case undefined:
            return noBody as BodyProvider<TRequest, TBody>;
        case "GET":
        case "DELETE":
            return noBody as BodyProvider<TRequest, TBody>;
        default:
            return extractEventBody;
    }
}

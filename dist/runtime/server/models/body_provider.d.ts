import type { EventHandlerRequest, H3Event } from "h3";
export type BodyProvider<TIn extends EventHandlerRequest, TBody> = (event: H3Event<TIn>) => Promise<TBody>;
/**
 * Default body provider that extracts and parses the request body using H3's readBody
 * @template TRequest - The event handler request type
 * @template TBody - The expected body type
 * @param event - The H3 event object
 * @returns Promise resolving to the parsed request body
 */
export declare function extractEventBody<TRequest extends EventHandlerRequest, TBody>(event: H3Event<TRequest>): Promise<TBody>;
export declare function noBody<TRequest extends EventHandlerRequest>(_: H3Event<TRequest>): Promise<undefined>;
export declare function getDefaultBodyProvider<TRequest extends EventHandlerRequest, TBody>(method?: "GET" | "POST" | "PUT" | "DELETE"): BodyProvider<TRequest, TBody>;

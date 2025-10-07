/**
 * Function type for processing backend responses before returning to the client
 * @template T - The backend response type
 * @template D - The final response type to return to the client
 */
export type BackendHandler<T, D> = (response: T) => Promise<D>;
/**
 * Default response handler that simply passes through the backend response
 * @template TBackendResponse - The type of response from the backend
 * @template TResponse - The final response type (defaults to backend response type)
 * @param response - The response from the backend API
 * @returns Promise resolving to the response cast to the expected type
 */
export declare function defaultHandler<TBackendResponse, TResponse>(response: TBackendResponse): Promise<TResponse>;

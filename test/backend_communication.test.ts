import { describe, it, expect, vi, beforeEach } from "vitest";
import type { H3Event } from "h3";
import {
    defineBackendHandler,
    defaultHandler,
    defaultFetcher,
    noBody,
} from "../src/runtime/server/utils/backend_communication";

// Mock dependencies
vi.mock("h3", () => ({
    createError: vi.fn((options) => new Error(`${options.statusCode}: ${options.statusMessage}`)),
    defineEventHandler: vi.fn((handler) => handler),
    readBody: vi.fn(),
}));

vi.mock("#auth", () => ({
    getServerSession: vi.fn(),
    getToken: vi.fn(),
}));

vi.mock("#imports", () => ({
    useRuntimeConfig: vi.fn(() => ({
        apiUrl: "https://api.example.com",
    })),
}));

// Mock global $fetch
const mockFetch = vi.fn();
global.$fetch = mockFetch as any;

describe("Backend Communication Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("noBody", () => {
        it("should return undefined", async () => {
            const mockEvent = {} as H3Event;
            const result = await noBody(mockEvent);
            expect(result).toBeUndefined();
        });
    });

    describe("defaultHandler", () => {
        it("should pass through the response unchanged", async () => {
            const testData = { id: 1, name: "test" };
            const result = await defaultHandler(testData);
            expect(result).toEqual(testData);
        });

        it("should handle null values", async () => {
            const result = await defaultHandler(null);
            expect(result).toBeNull();
        });

        it("should handle arrays", async () => {
            const testArray = [1, 2, 3];
            const result = await defaultHandler(testArray);
            expect(result).toEqual(testArray);
        });
    });

    describe("defaultFetcher", () => {
        it("should call $fetch with correct parameters for GET request", async () => {
            const mockResponse = { data: "test" };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await defaultFetcher(
                "https://api.example.com/test",
                "GET",
                undefined,
                { "Content-Type": "application/json" }
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/test",
                {
                    method: "GET",
                    body: undefined,
                    headers: { "Content-Type": "application/json" },
                }
            );
            expect(result).toEqual(mockResponse);
        });

        it("should call $fetch with correct parameters for POST request", async () => {
            const mockResponse = { success: true };
            const requestBody = { name: "test user" };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await defaultFetcher(
                "https://api.example.com/users",
                "POST",
                requestBody,
                { "Content-Type": "application/json" }
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users",
                {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                    headers: { "Content-Type": "application/json" },
                }
            );
            expect(result).toEqual(mockResponse);
        });

        it("should handle fetch errors", async () => {
            const fetchError = new Error("Network error");
            mockFetch.mockRejectedValue(fetchError);

            await expect(
                defaultFetcher(
                    "https://api.example.com/test",
                    "GET",
                    undefined,
                    {}
                )
            ).rejects.toThrow("Network error");
        });
    });

    describe("defineBackendHandler", () => {
        beforeEach(async () => {
            const { getServerSession, getToken } = await vi.importMock("#auth");
            const { useRuntimeConfig } = await vi.importMock("#imports");
            const { readBody } = await vi.importMock("h3");

            vi.mocked(useRuntimeConfig).mockReturnValue({
                apiUrl: "https://api.example.com",
            });
            vi.mocked(getServerSession).mockResolvedValue({
                user: { name: "Test User", email: "test@example.com" },
            });
            vi.mocked(getToken).mockResolvedValue({
                idToken: "mock-id-token",
                accessToken: "mock-access-token",
            });
            mockFetch.mockResolvedValue({ success: true });
        });

        it("should create a handler that makes authenticated requests", async () => {
            const handler = defineBackendHandler({
                url: "/users",
                method: "GET",
            });

            const mockEvent = {} as H3Event;
            const result = await handler(mockEvent);

            expect(mockGetServerSession).toHaveBeenCalledWith(mockEvent);
            expect(mockGetToken).toHaveBeenCalledWith({ event: mockEvent });
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users",
                {
                    method: "GET",
                    body: undefined,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer mock-id-token",
                        "X-Access-Token": JSON.stringify({
                            idToken: "mock-id-token",
                            accessToken: "mock-access-token",
                        }),
                    },
                }
            );
            expect(result).toEqual({ success: true });
        });

        it("should handle POST requests with body", async () => {
            const requestBody = { name: "John Doe" };
            vi.mocked(readBody).mockResolvedValue(requestBody);

            const handler = defineBackendHandler({
                url: "/users",
                method: "POST",
            });

            const mockEvent = {} as H3Event;
            await handler(mockEvent);

            expect(readBody).toHaveBeenCalledWith(mockEvent);
            expect(global.$fetch).toHaveBeenCalledWith(
                "https://api.example.com/users",
                {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer mock-id-token",
                        "X-Access-Token": JSON.stringify({
                            idToken: "mock-id-token",
                            accessToken: "mock-access-token",
                        }),
                    },
                }
            );
        });

        it("should throw 401 when user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);
            vi.mocked(getToken).mockResolvedValue(null);

            const handler = defineBackendHandler({
                url: "/users",
            });

            const mockEvent = {} as H3Event;

            await expect(handler(mockEvent)).rejects.toThrow(
                "401: Unauthorized"
            );
        });

        it("should throw 401 when session has RefreshAccessTokenError", async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: "user123" },
                error: "RefreshAccessTokenError",
            });

            const handler = defineBackendHandler({
                url: "/users",
            });

            const mockEvent = {} as H3Event;

            await expect(handler(mockEvent)).rejects.toThrow(
                "401: Token Refresh Failed"
            );
        });

        it("should use custom body provider", async () => {
            const customBody = { customField: "value" };
            const customBodyProvider = vi.fn().mockResolvedValue(customBody);

            const handler = defineBackendHandler({
                url: "/custom",
                method: "POST",
                bodyProvider: customBodyProvider,
            });

            const mockEvent = {} as H3Event;
            await handler(mockEvent);

            expect(customBodyProvider).toHaveBeenCalledWith(mockEvent);
            expect(global.$fetch).toHaveBeenCalledWith(
                "https://api.example.com/custom",
                expect.objectContaining({
                    body: JSON.stringify(customBody),
                })
            );
        });

        it("should use custom response handler", async () => {
            const backendResponse = { raw: "data" };
            const transformedResponse = { processed: "data" };
            const customHandler = vi.fn().mockResolvedValue(transformedResponse);
            
            (global.$fetch as any).mockResolvedValue(backendResponse);

            const handler = defineBackendHandler({
                url: "/transform",
                handler: customHandler,
            });

            const mockEvent = {} as H3Event;
            const result = await handler(mockEvent);

            expect(customHandler).toHaveBeenCalledWith(backendResponse);
            expect(result).toEqual(transformedResponse);
        });

        it("should use custom fetcher", async () => {
            const customResponse = { custom: "response" };
            const customFetcher = vi.fn().mockResolvedValue(customResponse);

            const handler = defineBackendHandler({
                url: "/custom-fetch",
                fetcher: customFetcher,
            });

            const mockEvent = {} as H3Event;
            const result = await handler(mockEvent);

            expect(customFetcher).toHaveBeenCalledWith(
                "https://api.example.com/custom-fetch",
                "GET",
                undefined,
                {
                    "Content-Type": "application/json",
                    Authorization: "Bearer mock-id-token",
                    "X-Access-Token": JSON.stringify({
                        idToken: "mock-id-token",
                        accessToken: "mock-access-token",
                    }),
                }
            );
            expect(result).toEqual(customResponse);
        });

        it("should handle backend errors gracefully", async () => {
            const backendError = new Error("Backend service unavailable");
            (global.$fetch as any).mockRejectedValue(backendError);

            const handler = defineBackendHandler({
                url: "/error-test",
            });

            const mockEvent = {} as H3Event;

            await expect(handler(mockEvent)).rejects.toThrow(
                "500: Backend Communication Error"
            );
        });

        it("should preserve H3 errors", async () => {
            const h3Error = {
                statusCode: 404,
                statusMessage: "Not Found",
                message: "Resource not found",
            };
            (global.$fetch as any).mockRejectedValue(h3Error);

            const handler = defineBackendHandler({
                url: "/not-found",
            });

            const mockEvent = {} as H3Event;

            await expect(handler(mockEvent)).rejects.toEqual(h3Error);
        });

        it("should handle different HTTP methods", async () => {
            const methods = ["GET", "POST", "PUT", "DELETE"] as const;

            for (const method of methods) {
                const handler = defineBackendHandler({
                    url: "/test",
                    method,
                });

                const mockEvent = {} as H3Event;
                await handler(mockEvent);

                expect(global.$fetch).toHaveBeenCalledWith(
                    "https://api.example.com/test",
                    expect.objectContaining({
                        method,
                    })
                );
            }
        });

        it("should not use readBody for GET and DELETE requests", async () => {
            const getHandler = defineBackendHandler({
                url: "/get-test",
                method: "GET",
            });

            const deleteHandler = defineBackendHandler({
                url: "/delete-test",
                method: "DELETE",
            });

            const mockEvent = {} as H3Event;
            
            await getHandler(mockEvent);
            await deleteHandler(mockEvent);

            // readBody should not be called for GET/DELETE
            expect(readBody).not.toHaveBeenCalled();
        });

        it("should handle missing idToken gracefully", async () => {
            vi.mocked(getToken).mockResolvedValue({
                accessToken: "mock-access-token",
                // no idToken
            });

            const handler = defineBackendHandler({
                url: "/no-id-token",
            });

            const mockEvent = {} as H3Event;
            await handler(mockEvent);

            expect(global.$fetch).toHaveBeenCalledWith(
                "https://api.example.com/no-id-token",
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "",
                    }),
                })
            );
        });
    });
});

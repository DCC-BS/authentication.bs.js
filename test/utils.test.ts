import { describe, it, expect, vi, beforeEach } from "vitest";
import type { H3Event } from "h3";
import {
    defaultHandler,
    defaultFetcher,
    noBody,
} from "../src/runtime/server/utils/backend_communication";

// Mock global $fetch - simplified approach
const mockFetch = vi.fn();
(global as any).$fetch = mockFetch;

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

        it("should handle complex objects", async () => {
            const complexObject = {
                user: { id: 1, name: "John" },
                metadata: { created: new Date(), tags: ["test", "user"] },
                nested: { deep: { value: "test" } },
            };
            const result = await defaultHandler(complexObject);
            expect(result).toEqual(complexObject);
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

        it("should handle PUT and DELETE requests", async () => {
            const putBody = { update: "value" };
            const putResponse = { updated: true };
            const deleteResponse = { deleted: true };
            
            mockFetch.mockResolvedValueOnce(putResponse);
            mockFetch.mockResolvedValueOnce(deleteResponse);

            // Test PUT
            const putResult = await defaultFetcher(
                "https://api.example.com/resource/1",
                "PUT",
                putBody,
                { "Content-Type": "application/json" }
            );

            expect(putResult).toEqual(putResponse);

            // Test DELETE
            const deleteResult = await defaultFetcher(
                "https://api.example.com/resource/1",
                "DELETE",
                undefined,
                { "Content-Type": "application/json" }
            );

            expect(deleteResult).toEqual(deleteResponse);
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

        it("should stringify body for all non-undefined values", async () => {
            mockFetch.mockResolvedValue({ success: true });

            // Test with object
            await defaultFetcher(
                "https://api.example.com/test",
                "POST",
                { key: "value" },
                {}
            );

            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/test",
                expect.objectContaining({
                    body: '{"key":"value"}',
                })
            );

            // Test with null
            await defaultFetcher(
                "https://api.example.com/test",
                "POST",
                null,
                {}
            );

            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/test",
                expect.objectContaining({
                    body: "null",
                })
            );
        });
    });

    describe("Type Safety Tests", () => {
        it("should support generic types in handlers", async () => {
            interface InputData {
                id: string;
                name: string;
            }

            interface OutputData {
                id: string;
                displayName: string;
            }

            const input: InputData = { id: "123", name: "John" };
            
            // Test that defaultHandler preserves types
            const result = await defaultHandler<InputData, OutputData>(input as any);
            expect(result).toEqual(input);
        });

        it("should work with complex nested types", async () => {
            interface NestedData {
                user: {
                    profile: {
                        preferences: {
                            theme: "dark" | "light";
                            language: string;
                        };
                    };
                };
            }

            const nestedData: NestedData = {
                user: {
                    profile: {
                        preferences: {
                            theme: "dark",
                            language: "en",
                        },
                    },
                },
            };

            const result = await defaultHandler(nestedData);
            expect(result.user.profile.preferences.theme).toBe("dark");
        });
    });

    describe("Error Handling", () => {
        it("should handle various error types in fetcher", async () => {
            const errors = [
                new Error("Network timeout"),
                new TypeError("Invalid response"),
                { message: "Custom error object" },
                "String error",
            ];

            for (const error of errors) {
                mockFetch.mockRejectedValueOnce(error);
                
                await expect(
                    defaultFetcher("https://api.example.com/test", "GET", undefined, {})
                ).rejects.toEqual(error);
            }
        });
    });

    describe("Integration with Real Scenarios", () => {
        it("should handle authentication-like scenarios", async () => {
            const authHeaders = {
                "Content-Type": "application/json",
                Authorization: "Bearer token123",
                "X-Access-Token": JSON.stringify({ sub: "user123" }),
            };

            const userProfile = {
                id: "user123",
                email: "user@example.com",
                roles: ["admin"],
            };

            mockFetch.mockResolvedValue(userProfile);

            const result = await defaultFetcher(
                "https://api.example.com/profile",
                "GET",
                undefined,
                authHeaders
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/profile",
                {
                    method: "GET",
                    body: undefined,
                    headers: authHeaders,
                }
            );
            expect(result).toEqual(userProfile);
        });

        it("should handle data transformation workflows", async () => {
            const rawData = { firstName: "John", lastName: "Doe", age: 30 };
            const transformedData = { fullName: "John Doe", isAdult: true };

            // Simulate a transformation handler
            const transformer = async (data: typeof rawData) => {
                return {
                    fullName: `${data.firstName} ${data.lastName}`,
                    isAdult: data.age >= 18,
                };
            };

            const result = await transformer(rawData);
            expect(result).toEqual(transformedData);

            // Test that defaultHandler would pass this through
            const handlerResult = await defaultHandler(result);
            expect(handlerResult).toEqual(transformedData);
        });
    });
});

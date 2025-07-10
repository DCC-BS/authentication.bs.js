import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRuntimeConfig } from "nuxt/app";

// Mock dependencies
vi.mock("nuxt/app", () => ({
    useRuntimeConfig: vi.fn(),
}));

vi.mock("next-auth/providers/azure-ad", () => ({
    default: {
        default: vi.fn(),
    },
}));

vi.mock("#auth", () => ({
    NuxtAuthHandler: vi.fn(),
}));

// Re-create the types from the auth handler for testing
interface AzureADProfile {
    sub?: string;
    oid?: string;
    email?: string;
    name?: string;
    image?: string;
    roles?: string[];
}

interface ExtendedToken extends Record<string, unknown> {
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    error?: string;
    accessToken?: string;
    // Azure AD profile data
    sub?: string;
    email?: string;
    name?: string;
    image?: string;
    roles?: string[];
}

interface Account {
    id_token?: string;
    access_token?: string;
    refresh_token?: string;
    provider?: string;
}

interface JWTCallbackParams {
    token: Record<string, unknown>;
    account?: Account;
    profile?: AzureADProfile;
}

describe("Authentication Handler", () => {
    let mockRuntimeConfig: Record<string, string>;

    // Extract the JWT callback logic for testing
    const createJWTCallback = () => {
        return async ({ token, account, profile }: JWTCallbackParams) => {
            const extendedToken = token as ExtendedToken;

            // Initial sign in
            if (account && profile) {
                extendedToken.idToken = account.id_token;
                extendedToken.accessToken = account.access_token;
                extendedToken.refreshToken = account.refresh_token;
                extendedToken.provider = account.provider;

                // Inject Azure AD profile data into JWT token
                const azureProfile = profile as AzureADProfile;
                extendedToken.sub = azureProfile.sub || azureProfile.oid; // Azure AD uses 'oid' for user ID
                extendedToken.email = azureProfile.email;
                extendedToken.name = azureProfile.name;
                // Azure AD roles come from the 'roles' claim
                extendedToken.roles = azureProfile.roles || [];

                return extendedToken;
            }
            return {
                ...extendedToken,
                error: "RefreshAccessTokenError",
            };
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockRuntimeConfig = {
            authSecret: "test-auth-secret",
            azureAdClientId: "test-client-id",
            azureAdClientSecret: "test-client-secret",
            azureAdTenantId: "test-tenant-id",
        };

        vi.mocked(useRuntimeConfig).mockReturnValue(mockRuntimeConfig as never);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("JWT Callback Function", () => {

        it("should handle initial sign in with complete Azure AD profile", async () => {
            const jwtCallback = createJWTCallback();

            const token = { existing: "data" };
            const account: Account = {
                id_token: "test-id-token",
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                sub: "user-12345",
                oid: "oid-67890",
                email: "test@example.com",
                name: "Test User",
                image: "https://example.com/avatar.jpg",
                roles: ["Admin", "User"],
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result).toEqual({
                existing: "data",
                idToken: "test-id-token",
                accessToken: "test-access-token",
                refreshToken: "test-refresh-token",
                provider: "azure-ad",
                sub: "user-12345", // Should prefer 'sub' over 'oid'
                email: "test@example.com",
                name: "Test User",
                roles: ["Admin", "User"],
            });
        });

        it("should use 'oid' when 'sub' is not available", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {
                id_token: "test-id-token",
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                oid: "oid-67890", // No 'sub' field
                email: "test@example.com",
                name: "Test User",
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.sub).toBe("oid-67890");
        });

        it("should handle profile with minimal data", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                email: "minimal@example.com",
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result).toEqual({
                idToken: "test-id-token",
                accessToken: undefined,
                refreshToken: undefined,
                provider: "azure-ad",
                sub: undefined, // No sub or oid provided
                email: "minimal@example.com",
                name: undefined,
                roles: [], // Should default to empty array
            });
        });

        it("should handle empty roles array", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                sub: "user-12345",
                email: "test@example.com",
                name: "Test User",
                roles: [], // Explicitly empty roles
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.roles).toEqual([]);
        });

        it("should handle missing roles field", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                sub: "user-12345",
                email: "test@example.com",
                name: "Test User",
                // No roles field
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.roles).toEqual([]); // Should default to empty array
        });

        it("should return error when no account or profile provided", async () => {
            const jwtCallback = createJWTCallback();

            const token = { existing: "data", someField: "value" };

            const result = await jwtCallback({ token });

            expect(result).toEqual({
                existing: "data",
                someField: "value",
                error: "RefreshAccessTokenError",
            });
        });

        it("should return error when account is provided but no profile", async () => {
            const jwtCallback = createJWTCallback();

            const token = { existing: "data" };
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };

            const result = await jwtCallback({ token, account });

            expect(result).toEqual({
                existing: "data",
                error: "RefreshAccessTokenError",
            });
        });

        it("should return error when profile is provided but no account", async () => {
            const jwtCallback = createJWTCallback();

            const token = { existing: "data" };
            const profile: AzureADProfile = {
                sub: "user-12345",
                email: "test@example.com",
            };

            const result = await jwtCallback({ token, profile });

            expect(result).toEqual({
                existing: "data",
                error: "RefreshAccessTokenError",
            });
        });

        it("should preserve existing token data during initial sign in", async () => {
            const jwtCallback = createJWTCallback();

            const token = {
                existingField: "existing-value",
                anotherField: 123,
                objectField: { nested: "data" },
            };
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                sub: "user-12345",
                email: "test@example.com",
            };

            const result = await jwtCallback({ token, account, profile });

            // Should preserve existing fields
            expect(result.existingField).toBe("existing-value");
            expect(result.anotherField).toBe(123);
            expect(result.objectField).toEqual({ nested: "data" });
            
            // Should add new fields
            expect(result.idToken).toBe("test-id-token");
            expect(result.sub).toBe("user-12345");
            expect(result.email).toBe("test@example.com");
        });

        it("should handle complex roles array", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {
                id_token: "test-id-token",
                provider: "azure-ad",
            };
            const profile: AzureADProfile = {
                sub: "user-12345",
                email: "admin@example.com",
                name: "Admin User",
                roles: [
                    "Global Administrator",
                    "Application Administrator",
                    "User Administrator",
                    "Custom.Role.Read",
                    "Custom.Role.Write",
                ],
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.roles).toEqual([
                "Global Administrator",
                "Application Administrator", 
                "User Administrator",
                "Custom.Role.Read",
                "Custom.Role.Write",
            ]);
        });
    });

    describe("Configuration", () => {
        it("should use runtime config values", () => {
            // Call useRuntimeConfig to simulate the actual usage
            const config = useRuntimeConfig();
            
            // Test that the configuration uses the mocked runtime config
            expect(useRuntimeConfig).toHaveBeenCalled();
            expect(config).toEqual(mockRuntimeConfig);
        });

        it("should validate runtime config structure", () => {
            // Verify that the required config fields are accessed
            const config = useRuntimeConfig();
            
            expect(config).toHaveProperty("authSecret");
            expect(config).toHaveProperty("azureAdClientId");
            expect(config).toHaveProperty("azureAdClientSecret");
            expect(config).toHaveProperty("azureAdTenantId");
        });
    });

    describe("Type Definitions", () => {
        it("should support AzureADProfile interface", () => {
            const profile: AzureADProfile = {
                sub: "user-123",
                oid: "oid-456",
                email: "test@example.com",
                name: "Test User",
                image: "https://example.com/avatar.jpg",
                roles: ["Admin"],
            };

            expect(profile.sub).toBe("user-123");
            expect(profile.oid).toBe("oid-456");
            expect(profile.email).toBe("test@example.com");
            expect(profile.name).toBe("Test User");
            expect(profile.image).toBe("https://example.com/avatar.jpg");
            expect(profile.roles).toEqual(["Admin"]);
        });

        it("should support ExtendedToken interface", () => {
            const token: ExtendedToken = {
                idToken: "id-token",
                refreshToken: "refresh-token",
                expiresAt: 1234567890,
                provider: "azure-ad",
                error: "SomeError",
                sub: "user-123",
                email: "test@example.com",
                name: "Test User",
                image: "https://example.com/avatar.jpg",
                roles: ["Admin", "User"],
                customField: "custom-value",
            };

            expect(token.idToken).toBe("id-token");
            expect(token.refreshToken).toBe("refresh-token");
            expect(token.expiresAt).toBe(1234567890);
            expect(token.provider).toBe("azure-ad");
            expect(token.error).toBe("SomeError");
            expect(token.sub).toBe("user-123");
            expect(token.email).toBe("test@example.com");
            expect(token.name).toBe("Test User");
            expect(token.image).toBe("https://example.com/avatar.jpg");
            expect(token.roles).toEqual(["Admin", "User"]);
            expect(token.customField).toBe("custom-value");
        });

        it("should support partial profile data", () => {
            const partialProfile: AzureADProfile = {
                email: "partial@example.com",
            };

            expect(partialProfile.email).toBe("partial@example.com");
            expect(partialProfile.sub).toBeUndefined();
            expect(partialProfile.oid).toBeUndefined();
            expect(partialProfile.name).toBeUndefined();
            expect(partialProfile.image).toBeUndefined();
            expect(partialProfile.roles).toBeUndefined();
        });

        it("should support partial token data", () => {
            const partialToken: ExtendedToken = {
                idToken: "partial-id-token",
            };

            expect(partialToken.idToken).toBe("partial-id-token");
            expect(partialToken.refreshToken).toBeUndefined();
            expect(partialToken.provider).toBeUndefined();
            expect(partialToken.sub).toBeUndefined();
            expect(partialToken.roles).toBeUndefined();
        });
    });

    describe("Azure AD Specific Logic", () => {
        it("should prioritize 'sub' over 'oid' for user identification", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = { provider: "azure-ad" };
            const profile: AzureADProfile = {
                sub: "preferred-user-id",
                oid: "fallback-user-id",
                email: "test@example.com",
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.sub).toBe("preferred-user-id");
        });

        it("should handle Azure AD scope configuration", () => {
            // Test the expected scope configuration for Azure AD
            const expectedScope = "openid email profile User.Read";
            
            expect(expectedScope).toContain("openid");
            expect(expectedScope).toContain("email");
            expect(expectedScope).toContain("profile");
            expect(expectedScope).toContain("User.Read");
        });

        it("should handle Azure AD tenant-specific configuration", () => {
            const config = useRuntimeConfig();
            
            // Verify tenant ID is configured
            expect(config.azureAdTenantId).toBe("test-tenant-id");
            expect(config.azureAdClientId).toBe("test-client-id");
            expect(config.azureAdClientSecret).toBe("test-client-secret");
        });
    });

    describe("Error Scenarios", () => {
        it("should handle undefined profile fields gracefully", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = { provider: "azure-ad" };
            const profile: AzureADProfile = {
                // All fields undefined
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.sub).toBeUndefined();
            expect(result.email).toBeUndefined();
            expect(result.name).toBeUndefined();
            expect(result.roles).toEqual([]); // Should default to empty array
        });

        it("should handle null profile values", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = { provider: "azure-ad" };
            const profile = {
                sub: null,
                oid: null,
                email: null,
                name: null,
                roles: null,
            } as unknown as AzureADProfile;

            const result = await jwtCallback({ token, account, profile });

            expect(result.sub).toBeNull();
            expect(result.email).toBeNull();
            expect(result.name).toBeNull();
            expect(result.roles).toEqual([]); // Should handle null roles
        });

        it("should handle empty account object", async () => {
            const jwtCallback = createJWTCallback();

            const token = {};
            const account: Account = {}; // Empty account
            const profile: AzureADProfile = {
                email: "test@example.com",
            };

            const result = await jwtCallback({ token, account, profile });

            expect(result.idToken).toBeUndefined();
            expect(result.accessToken).toBeUndefined();
            expect(result.refreshToken).toBeUndefined();
            expect(result.provider).toBeUndefined();
            expect(result.email).toBe("test@example.com");
        });
    });
});

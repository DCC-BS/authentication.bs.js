import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Nuxt } from "@nuxt/schema";

// Mock dependencies
const mockCreateResolver = vi.fn();
const mockInstallModule = vi.fn();
const mockExtendPages = vi.fn();
const mockAddServerScanDir = vi.fn();

vi.mock("@nuxt/kit", () => ({
    addServerHandler: vi.fn(),
    addServerImportsDir: vi.fn(),
    addServerScanDir: mockAddServerScanDir,
    createResolver: mockCreateResolver,
    defineNuxtModule: vi.fn((config) => config),
    extendPages: mockExtendPages,
    installModule: mockInstallModule,
}));

describe("Nuxt Module", () => {
    let moduleSetup: any;
    let mockNuxt: Nuxt;
    let mockResolver: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        // Mock resolver
        mockResolver = {
            resolve: vi.fn((path: string) => `/resolved${path}`),
        };
        mockCreateResolver.mockReturnValue(mockResolver);

        // Mock Nuxt instance
        mockNuxt = {
            options: {
                runtimeConfig: {},
            },
        } as Nuxt;

        // Set up environment variables
        process.env.AZURE_AD_TENANT_ID = "test-tenant-id";
        process.env.AZURE_AD_CLIENT_ID = "test-client-id";
        process.env.AZURE_AD_CLIENT_SECRET = "test-client-secret";
        process.env.NUXT_AUTH_SECRET = "test-auth-secret";

        // Import the module
        const module = await import("../src/module");
        moduleSetup = module.default.setup;
    });

    it("should have correct module metadata", async () => {
        const module = await import("../src/module");
        expect(module.default.meta).toEqual({
            name: "authentication.bs.js",
            configKey: "authentication.bs.js",
        });
        expect(module.default.defaults).toEqual({});
    });

    it("should set runtime configuration from environment variables", async () => {
        await moduleSetup({}, mockNuxt);

        expect(mockNuxt.options.runtimeConfig).toEqual({
            azureAdTenantId: "test-tenant-id",
            azureAdClientId: "test-client-id",
            azureAdClientSecret: "test-client-secret",
            authSecret: "test-auth-secret",
        });
    });

    it("should install @sidebase/nuxt-auth module with correct configuration", async () => {
        await moduleSetup({}, mockNuxt);

        expect(mockInstallModule).toHaveBeenCalledWith("@sidebase/nuxt-auth", {
            isEnabled: true,
            globalAppMiddleware: true,
            originEnvKey: "AUTH_ORIGIN",
            provider: {
                type: "authjs",
                defaultProvider: "azureAd",
                addDefaultCallbackUrl: true,
            },
            sessionRefresh: {
                enablePeriodically: 10000,
                enableOnWindowFocus: true,
            },
        });
    });

    it("should create resolver with correct URL", async () => {
        await moduleSetup({}, mockNuxt);

        expect(mockCreateResolver).toHaveBeenCalledWith(expect.any(String));
    });

    it("should extend pages with auth signin route", async () => {
        await moduleSetup({}, mockNuxt);

        expect(mockExtendPages).toHaveBeenCalledWith(expect.any(Function));

        // Test the callback function passed to extendPages
        const extendPagesCallback = mockExtendPages.mock.calls[0][0];
        const mockPages: any[] = [];
        
        extendPagesCallback(mockPages);

        expect(mockPages).toHaveLength(1);
        expect(mockPages[0]).toEqual({
            name: "auth-signin",
            path: "/auth/signin",
            file: "/resolved./runtime/pages/auth/signIn.vue",
            meta: {
                auth: {
                    unauthenticatedOnly: true,
                    navigateAuthenticatedTo: "/",
                },
                layout: "auth",
            },
        });
    });

    it("should add server scan directory", async () => {
        await moduleSetup({}, mockNuxt);

        expect(mockAddServerScanDir).toHaveBeenCalledWith("/resolved./runtime/server");
    });

    it("should handle missing environment variables", async () => {
        // Clear environment variables
        delete process.env.AZURE_AD_TENANT_ID;
        delete process.env.AZURE_AD_CLIENT_ID;
        delete process.env.AZURE_AD_CLIENT_SECRET;
        delete process.env.NUXT_AUTH_SECRET;

        await moduleSetup({}, mockNuxt);

        expect(mockNuxt.options.runtimeConfig).toEqual({
            azureAdTenantId: undefined,
            azureAdClientId: undefined,
            azureAdClientSecret: undefined,
            authSecret: undefined,
        });
    });

    it("should preserve existing runtime config", async () => {
        mockNuxt.options.runtimeConfig = {
            existingConfig: "preserved",
            azureAdTenantId: "existing-tenant", // Should be overridden
        };

        await moduleSetup({}, mockNuxt);

        expect(mockNuxt.options.runtimeConfig).toEqual({
            existingConfig: "preserved",
            azureAdTenantId: "test-tenant-id", // Overridden by env var
            azureAdClientId: "test-client-id",
            azureAdClientSecret: "test-client-secret",
            authSecret: "test-auth-secret",
        });
    });

    it("should work with different environment variable values", async () => {
        process.env.AZURE_AD_TENANT_ID = "different-tenant";
        process.env.AZURE_AD_CLIENT_ID = "different-client";
        process.env.AZURE_AD_CLIENT_SECRET = "different-secret";
        process.env.NUXT_AUTH_SECRET = "different-auth-secret";

        await moduleSetup({}, mockNuxt);

        expect(mockNuxt.options.runtimeConfig).toEqual({
            azureAdTenantId: "different-tenant",
            azureAdClientId: "different-client",
            azureAdClientSecret: "different-secret",
            authSecret: "different-auth-secret",
        });
    });
});

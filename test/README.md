# Authentication System Tests

This directory contains comprehensive tests for the authentication system components.

## Test Files

### 1. `auth_handler.test.ts`
Tests the Azure AD authentication handler and JWT callback logic:

- **JWT Callback Function**: Tests token processing with Azure AD profiles and account data
- **Configuration**: Tests runtime configuration usage and validation
- **Type Definitions**: Tests Azure AD profile and extended token interfaces
- **Azure AD Specific Logic**: Tests user ID prioritization (sub vs oid) and scope configuration
- **Error Scenarios**: Tests handling of undefined/null profile fields and missing data

### 2. `backend_communication_isolated.test.ts`
Tests the core utility functions in isolation without dependencies on the main module:

- **noBody utility**: Tests that the function returns `undefined` as expected
- **defaultHandler utility**: Tests response pass-through functionality with various data types
- **defaultFetcher utility**: Tests HTTP requests with different methods and error handling
- **body extraction utility**: Tests H3 event body extraction and error scenarios
- **integration scenarios**: Tests end-to-end API call flows
- **authentication flow scenarios**: Tests token-based authentication patterns
- **error handling scenarios**: Tests backend and network error handling

### 3. `backend_communication_types.test.ts`
Tests type definitions and interfaces:

- **Function signatures**: Validates TypeScript types for BodyProvider, BackendHandler, and Fetcher
- **DefineBackendHandler options**: Tests the options interface structure
- **HTTP method types**: Validates supported HTTP methods
- **Error handling types**: Tests error configuration structures
- **JWT token types**: Tests token interface definitions
- **Session types**: Tests session object structures
- **Request header types**: Tests header type definitions
- **Runtime config types**: Tests configuration object types

## Test Coverage

The tests cover:

✅ **Authentication Handler**
- Azure AD JWT callback processing
- Token mapping from account/profile to extended token
- User ID extraction (sub vs oid preference)
- Role-based access control (RBAC) handling
- Profile data normalization
- Error handling for refresh token failures

✅ **Core Functions**
- `noBody()` - Returns undefined for GET/DELETE requests
- `defaultHandler()` - Passes through responses unchanged
- `defaultFetcher()` - Makes HTTP requests using Nuxt's $fetch

✅ **Authentication Flows**
- Token-based authentication with Bearer tokens
- Requests with and without authentication
- JWT token handling with idToken, accessToken, refreshToken

✅ **Error Handling**
- Network errors
- Backend service errors
- Invalid request body handling
- Authentication failures

✅ **HTTP Methods**
- GET, POST, PUT, DELETE requests
- Proper header handling
- Request body processing

✅ **Type Safety**
- All TypeScript interfaces and types
- Generic type parameters
- Function signatures

## Running the Tests

### Run all authentication system tests:
```bash
npx vitest test/ --config test/vitest.config.ts --run
```

### Run authentication handler tests:
```bash
npx vitest test/auth_handler.test.ts --config test/vitest.config.ts --run
```

### Run backend communication tests:
```bash
npx vitest test/backend_communication_*.test.ts --config test/vitest.config.ts --run
```

### Run with coverage:
```bash
npx vitest test/ --config test/vitest.config.ts --coverage --run
```

### Run with verbose output:
```bash
npx vitest test/ --config test/vitest.config.ts --run --reporter=verbose
```

## Test Environment

The tests use:
- **Vitest** as the test runner
- **Node.js environment** (not Nuxt environment to avoid dependency issues)
- **Vi mocking** for external dependencies
- **TypeScript** for type safety

## Mocked Dependencies

The tests mock the following external dependencies:
- `h3` functions (`readBody`, `defineEventHandler`, `createError`)
- `nuxt/app` (`useRuntimeConfig`)
- `next-auth/providers/azure-ad` (Azure AD provider)
- `#auth` (`NuxtAuthHandler`)
- Global `$fetch` function

This allows testing the utility functions in isolation without requiring a full Nuxt/H3 environment.

## Test Philosophy

The tests follow these principles:
1. **Isolation**: Test individual functions without external dependencies
2. **Comprehensive Coverage**: Cover happy paths, error cases, and edge cases
3. **Type Safety**: Validate TypeScript interfaces and type definitions
4. **Real-world Scenarios**: Test authentication flows and API communication patterns
5. **Maintainability**: Clear test descriptions and organized test structure

## Azure AD Authentication Testing

The authentication handler tests specifically cover:

### JWT Token Processing
- Mapping Azure AD account data to extended tokens
- Handling ID tokens, access tokens, and refresh tokens
- Provider identification and tracking

### Profile Data Handling
- Azure AD profile structure (`sub`, `oid`, `email`, `name`, `image`, `roles`)
- Preference of `sub` over `oid` for user identification
- Role array processing and normalization
- Handling missing or undefined profile fields

### Error Scenarios
- Missing account or profile data
- Token refresh failures
- Partial authentication data
- Null/undefined field handling

### Configuration Management
- Runtime configuration access and validation
- Azure AD client credentials setup
- Tenant-specific configuration
- OAuth scope configuration (`openid email profile User.Read`)

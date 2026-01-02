> [!WARNING]
> This package is depricated use the [auth](https://github.com/DCC-BS/nuxt-layers/tree/main/auth) nuxt layer form [nuxt-layers](https://github.com/DCC-BS/nuxt-layers).

# authentication.bs.js

![GitHub package.json version](https://img.shields.io/github/package-json/v/DCC-BS/authentication.bs.js)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/DCC-BS/authentication.bs.js/publish.yml)
<!-- [![codecov](https://codecov.io/gh/DCC-BS/authentication.bs.js/graph/badge.svg?token=3PBNL8OR24)](https://codecov.io/gh/DCC-BS/authentication.bs.js) -->

A comprehensive Nuxt module that provides Azure Active Directory authentication and seamless backend communication for TypeScript/JavaScript applications. This module handles user authentication, session management, token refresh, and provides utilities for making authenticated requests to backend APIs.

## Features

- 🔐 **Azure AD Authentication** - Complete OAuth2/OpenID Connect integration
- 🛡️ **Session Management** - Automatic token refresh and session handling
- 🔄 **Backend Proxy** - Simplified authenticated API communication
- 🌐 **Internationalization** - Built-in i18n support (EN/DE)
- 📱 **SSR Compatible** - Full server-side rendering support
- 🎨 **Custom Sign-in Pages** - Pre-built authentication UI components
- 🛠️ **TypeScript First** - Complete type safety and IntelliSense support

## Azure Entra Configuration

### Prerequisites

You need two Azure AD applications:

1. A client application for the frontend (the nuxt app)
2. A backend application for the backend (the fastapi app)

The apps are both single tenant apps.

### API / FastAPI Azure Entra ID App Configuration

Visit the [Azure Portal](https://portal.azure.com) and configure the Entra App for the backend created by the IT department.

* Change token version to `v2.0`
  * In the left menu bar, click `Manifest` and find the line that says `requestedAccessTokenVersion`. Change its value from `null` to `2`
  * Click `Save`
* Add an application scope
  * In the left menu bar, click `Expose an API`
  * Click `Add a scope`
  * Use default Application ID URI (e.g. `api://<your-app-id>`)
  * Set `Scope name` to `user_impersonation`
  * Set "Who can consent?" to `Admins and users`
  * Set `Admin consent display name` to `User impersonation`
  * Set `Admin consent description` to `Allow the app to impersonate the user`
  * Set `User consent display name` to `User impersonation`
  * Set `User consent description` to `Allow the app to impersonate the user`
  * Set `State` to `Enabled`
  * Click `Add scope`
  * Click `Save`
* Note down relevant information:
  * `Application (client) ID`
  * `Directory (tenant) ID`
  * `Application ID URI` (e.g. `api://<your-app-id>/user_impersonation`)

If you need application roles follow these steps:
* In the left menu bar, click `Roles and administrators`
  * Click `Add a role`
  * Set `Display name` to `<your-role-name>`
  * Set `Description` to `<your-role-description>`
  * Set `Value` to `<your-role-value>` This is the value that will be used to identify the role in the backend.
  * Set `Allowed member types` to `Both`
  * Click `Add role`
  * Click `Save`

Now we need to assign user and groups to that roles:

* Navigate to to the Azure Entra Enterprise Application
  * Click `Users and groups`
  * Click `Add user/group`
  * Select the user or group you want to assign the role to
  * Select the role you want to assign
  * Click `Assign`
  * Click `Save`

Now we need to configure the FastAPI app to authorize the API calls:

Install the [fastapi-azure-auth](https://intility.github.io/fastapi-azure-auth/installation) package:

```bash
uv add fastapi-azure-auth
```

Configure `.env` file:

```env
AZURE_CLIENT_ID="YOUR_AZURE_CLIENT_ID"
AZURE_TENANT_ID="YOUR_AZURE_TENANT_ID"
AZURE_AD_API_CLIENT_ID="YOUR AZURE API CLIENT ID"
SCOPE_DESCRIPTION="user_impersonation" # The scope name of the Azure Entra Backend API App
CLIENT_URL="http://localhost:3000" # The URL of the Nuxt app
```


Add the following to your `app.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import os

scope_name = f"api://{os.getenv('AZURE_CLIENT_ID')}/{os.getenv('SCOPE_DESCRIPTION')}"
scopes = {
    scope_name: os.getenv('SCOPE_DESCRIPTION'),
}
azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=os.getenv('AZURE_CLIENT_ID'),
    tenant_id=os.getenv('AZURE_TENANT_ID'),
    scopes=scopes,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Load OpenID config on startup.
    """
    await azure_scheme.openid_config.load_config()
    yield

def get_app() -> FastAPI:
    app: FastAPI = FastAPI(
        title="Your API",
        lifespan=lifespan,
    )

    origins: list[str] = [os.getenv('CLIENT_URL'), "http://localhost", "http://localhost:8080", "http://localhost:8000"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app

app = get_app()

# Example route
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(azure_scheme)]):
    return current_user
```

### Client Application

Visit the [Azure Portal](https://portal.azure.com) and configure the Entra App for the nuxt frontend created by the IT department.

* Change the token version to `v2.0`
  * In the left menu bar, click `Manifest` and find the line that says `requestedAccessTokenVersion`. Change its value from `null` to `2`
  * Click `Save`
* Add authentication to the frontend app
  * In the left menu bar, click `Authentication`
  * Click `Add a platform`
  * Select `Web`
  * Set `Redirect URIs` to `http://localhost:3000/api/auth/callback/azure-ad`
  * No Access Tokens or ID Tokens are needed (do not check the boxes)
  * Click `Save`
* Configure the API permissions
  * In the left menu bar, click `API Permissions`
  * Click `Add a permission`
  * Click `My APIs`
  * Select the API you want to grant permissions to
  * Select the `user_impersonation` scope / permission
  * Click `Add permissions`
  * Click `Save`
  * ** IMPORTANT **: Ask someone from the IT department / EntraID team to grant admin consent for the `user_impersonation` scope / permission.
* Create a client secret
  * In the left menu bar, click `Certificates & secrets`
  * Click `New client secret`
  * Set `Description` to `Nuxt frontend client secret`
  * Click `Add`
  * Note down the secret **value** (not the key id!)
* Note down relevant information:
  * `Application (client) ID`
  * `Client secret`
  * `Directory (tenant) ID`

Now you can follow the [Quick Setup](#quick-setup) instructions.

## Quick Setup

Install the module to your Nuxt application with:

```bash
bun add git+https://github.com/DCC-BS/authentication.bs.js.git#v1.1.0
```
replace `v1.1.0` with the latest version tag: ![GitHub package.json version](https://img.shields.io/github/package-json/v/DCC-BS/authentication.bs.js)


Add it to your `nuxt.config.ts`:
```ts
export default defineNuxtConfig({
    ...
    modules: [
        '@dcc-bs/authentication.bs.js',
        ...
    ],
    ...
})
```

add the following envoriment variables to your `.env` file:
```env
NUXT_AUTH_SECRET="YOUR_REALLY_STRONG_SECRET_FOR_SESSION_ENCRYPTION_32_CHARS_MIN" # Generate one: openssl rand -base64 32

AZURE_AD_TENANT_ID="YOUR_AZURE_TENANT_ID"
AZURE_AD_CLIENT_ID="YOUR_AZURE_CLIENT_ID"
AZURE_AD_CLIENT_SECRET="YOUR_AZURE_CLIENT_SECRET"
AZURE_AD_API_CLIENT_ID="YOUR_AZURE_BACKEND_API_CLIENT_ID"

# Only required for production
AUTH_ORIGIN=https://your_domain_name/api/auth
```

That's it! You can now use authentication.bs.js in your Nuxt app ✨

## Usage

### Basic Backend Communication

For the API use the [Authentication for FastAPI](https://github.com/DCC-BS/authentication.bs.py) Python package. To communicate with the backend, you can use the `defineBackendHandler` function in your Nuxt server routes:

```ts
// server/api/docs.get.ts
export default defineBackendHandler({
    url: "/docs",
});
```

Call this endpoint from your Nuxt client:

```ts
const docs = await $fetch("/api/docs");
```

This automatically handles authentication, sets the `Authorization` header with the Bearer token, and forwards the request to your backend.

### HTTP Methods

To use different HTTP methods, specify the `method` option:

```ts
// server/api/docs.post.ts
export default defineBackendHandler({
    url: "/docs",
    method: "POST", // or "PUT", "DELETE", etc.
});
```

### Advanced Usage

The `defineBackendHandler` performs three main steps:
1. **Body Processing** - Extracts and validates the request body
2. **Backend Communication** - Makes authenticated requests using `$fetch`
3. **Response Transformation** - Processes and returns the backend response

Each step can be customized with additional options.

### Custom Body Processing

Customize how request bodies are extracted and validated:

```ts
export default defineBackendHandler({
    url: "/advisor/validate",
    method: "POST",
    async bodyProvider(event) {
        const { text, docs } = await readBody(event);

        if (!text || !docs) {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid input",
            });
        }

        return { text, docs };
    },
});
```

### Custom HTTP Client

For specialized needs like streaming responses, provide a custom fetcher:

```ts
export default defineBackendHandler({
    url: "/quick-action",
    method: "POST",
    fetcher: async (url, method, body, headers) => {
        return await fetch(url, {
            method,
            body: JSON.stringify(body),
            headers: headers,
        });
    },
});
```

### Response Transformation

Transform backend responses before returning them to the client:

```ts
interface BackendDoc {
    id: string;
    title: string;
    content: string;
}

interface BackendResponse {
    docs: BackendDoc[];
}

interface FrontendDoc {
    id: string;
    title: string;
    content: string;
}

export default defineBackendHandler<
    never,
    never,
    BackendResponse,
    FrontendDoc[]
>({
    url: "/docs",
    method: "POST",
    handler: async (response) => {
        return response.docs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            content: doc.content,
        }));
    },
});
```

## API Reference

### Core Functions

#### `defineBackendHandler<TRequest, TBody, TBackendResponse, TResponse>(options)`

Creates a Nuxt server event handler that proxies requests to a backend API with authentication.

**Type Parameters:**
- `TRequest` - The type of the incoming request event
- `TBody` - The type of the request body
- `TBackendResponse` - The type of response expected from the backend API
- `TResponse` - The final response type returned to the client (defaults to `TBackendResponse`)

**Parameters:**
- `options.url` (string) - The backend API endpoint URL (relative to the configured API base URL)
- `options.method` (optional) - HTTP method: `"GET"` | `"POST"` | `"PUT"` | `"DELETE"` (defaults to `"GET"`)
- `options.bodyProvider` (optional) - Function to extract the request body (defaults to `readBody` for POST/PUT, `noBody` for GET/DELETE)
- `options.handler` (optional) - Function to transform the backend response (defaults to pass-through)
- `options.fetcher` (optional) - Function to make HTTP requests (defaults to `$fetch`)

**Returns:** An H3 event handler that can be used in Nuxt server routes

**Throws:**
- `401` - When user is not authenticated or token refresh fails
- `500` - For backend communication errors

**Example:**
```ts
// Simple GET request
export default defineBackendHandler({
    url: "/users"
});

// POST with custom body validation
export default defineBackendHandler({
    url: "/users",
    method: "POST",
    bodyProvider: async (event) => {
        const body = await readBody(event);
        if (!body.email) throw createError({ statusCode: 400, statusMessage: "Email required" });
        return body;
    }
});

// With response transformation
export default defineBackendHandler<{}, {}, User[], PublicUser[]>({
    url: "/users",
    handler: async (users) => users.map(user => ({ id: user.id, name: user.name }))
});
```

### Type Definitions

#### `BodyProvider<TIn, TBody>`

Function type for extracting the request body from an H3 event.

```ts
type BodyProvider<TIn extends EventHandlerRequest, TBody> = (
    event: H3Event<TIn>
) => Promise<TBody>;
```

#### `BackendHandler<T, D>`

Function type for processing backend responses before returning to the client.

```ts
type BackendHandler<T, D> = (response: T) => Promise<D>;
```

#### `Fetcher<T>`

Function type for making HTTP requests to the backend.

```ts
type Fetcher<T> = (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: unknown,
    headers: Record<string, string>
) => Promise<T>;
```

### Utility Functions

#### `noBody(event): Promise<undefined>`

A body provider that returns `undefined`. Used for GET and DELETE requests.

#### `defaultHandler<TBackendResponse, TResponse>(response): Promise<TResponse>`

Default response handler that passes through the backend response without transformation.

#### `defaultFetcher<T>(url, method, body, headers): Promise<T>`

Default fetcher that uses Nuxt's `$fetch` utility with JSON serialization.

### Authentication Types

#### `ExtendedSession`

Extended session type that may include error information for token refresh failures.

```ts
interface ExtendedSession extends Session {
    error?: string;
}
```

#### `ExtendedJWT`

Extended JWT type that includes Azure AD specific tokens and user information.

```ts
interface ExtendedJWT extends JWT {
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    sub?: string;
    email?: string;
    name?: string;
    roles?: string[];
}
```

### Server Functions

#### `getServerSession(event): Promise<ExtendedSession | null>`

Get the server-side session for the current request.

**Parameters:**
- `event` - The H3 event object from the request

**Returns:** Promise resolving to the session or null if not authenticated

#### `getToken(options): Promise<ExtendedJWT | null>`

Get the JWT token for the current request.

**Parameters:**
- `options.event` - The H3 event object
- `options.secret` (optional) - JWT secret
- `options.secureCookie` (optional) - Whether to use secure cookies
- `options.salt` (optional) - Salt for cookie encryption

**Returns:** Promise resolving to the JWT token or null if not found

### Internationalization

#### `useI18n(locale?): { t: (key: string) => string }`

Hook for using internationalization within the authentication context.

**Parameters:**
- `locale` (optional) - The locale to use (defaults to "de")

**Returns:** Object with translation function

#### `t(key: string, locale?): string`

Direct translation function for getting localized strings.

**Parameters:**
- `key` - The translation key (supports dot notation for nested keys)
- `locale` (optional) - The locale to use (defaults to "de")

**Returns:** Translated string or the key if translation not found

**Available Locales:** `"en"`, `"de"`

**Available Translation Keys:**
- `auth.welcomeBack`
- `auth.signInToContinue`
- `auth.connecting`
- `auth.authenticating`
- `auth.redirecting`
- `auth.azureAdDescription`


## Configuration

### Environment Variables

The module requires the following environment variables:

```env
# Required - Session encryption (minimum 32 characters)
NUXT_AUTH_SECRET="YOUR_REALLY_STRONG_SECRET_FOR_SESSION_ENCRYPTION_32_CHARS_MIN"

# Required - Azure AD configuration
AZURE_AD_TENANT_ID="YOUR_AZURE_TENANT_ID"
AZURE_AD_CLIENT_ID="YOUR_AZURE_CLIENT_ID" 
AZURE_AD_CLIENT_SECRET="YOUR_AZURE_CLIENT_SECRET"

# Required for production
AUTH_ORIGIN="https://your_domain_name/api/auth"

# Required - Backend API base URL
API_URL="https://your-backend-api.com"
```


## Middleware and Pages

### Automatic Route Protection

The module automatically adds global authentication middleware. Pages are protected by default unless explicitly marked as public:

```vue
<!-- pages/public.vue -->
<template>
    <div>Public content</div>
</template>

<script setup>
definePageMeta({
    auth: false
})
</script>
```

### Custom Sign-in Page

The module provides a pre-built sign-in page at `/auth/signin` with:
- Azure AD integration
- Loading states and animations
- Internationalization support
- Responsive design
- Error handling

## TypeScript Support

The module is built with TypeScript-first approach and provides:

- Complete type definitions for all exported functions
- Generic types for request/response handling
- IntelliSense support in IDEs
- Compile-time type checking for authentication flows

```ts
// Full type safety in your handlers
export default defineBackendHandler<
    EventHandlerRequest,           // Request type
    { userId: string },           // Body type
    { user: BackendUser },        // Backend response type  
    { user: FrontendUser }        // Final response type
>({
    url: "/user",
    method: "POST",
    bodyProvider: async (event) => {
        const { userId } = await readBody<{ userId: string }>(event);
        return { userId };
    },
    handler: async (response) => {
        return {
            user: transformUser(response.user)
        };
    }
});
```



## Testing

The module includes comprehensive test coverage. Run tests with:

```bash
# Run all tests
bun test

# Run tests in watch mode  
bun test:watch

# Generate coverage report
bun test:coverage
```

### Test Structure
- `test/auth_handler.test.ts` - Authentication flow tests
- `test/backend_communication_isolated.test.ts` - Backend communication unit tests
- `test/backend_communication_types.test.ts` - Type definition tests

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/DCC-BS/authentication.bs.js.git
cd authentication.bs.js

# Install dependencies
bun install

# Prepare development environment
bun dev:prepare

# Start development server
bun dev
```

### Project Structure

```
src/
├── module.ts                    # Main Nuxt module definition
├── runtime/
│   ├── localization.ts         # Internationalization utilities
│   ├── pages/
│   │   └── auth/
│   │       └── signIn.vue      # Custom sign-in page component
│   └── server/
│       ├── api/
│       │   └── auth/
│       │       └── [...].ts    # Authentication API handler
│       └── utils/
│           └── backend_communication.ts  # Core backend utilities
types/
└── auth.d.ts                   # TypeScript declarations
```

### Building

```bash
# Build for production
bun prepack

# Build and prepare for release
bun release
```

## License

[MIT](LICENSE) © Data Competence Center Basel-Stadt

<a href="https://www.bs.ch/schwerpunkte/daten/databs/schwerpunkte/datenwissenschaften-und-ki"><img src="https://github.com/DCC-BS/.github/blob/main/_imgs/databs_log.png?raw=true" alt="DCC Logo" width="200" /></a>

Datenwissenschaften und KI <br>
Developed with ❤️ by Data Alchemy Team

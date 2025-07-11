# authentication.bs.js

![GitHub package.json version](https://img.shields.io/github/package-json/v/DCC-BS/authentication.bs.js)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/DCC-BS/authentication.bs.js/publish.yml)
[![codecov](https://codecov.io/gh/DCC-BS/authentication.bs.js/graph/badge.svg?token=3PBNL8OR24)](https://codecov.io/gh/DCC-BS/authentication.bs.js)

TODO

## Quick Setup

Install the module to your Nuxt application with:

```bash
bun add git+https://github.com/DCC-BS/authentication.bs.js.git#v1.0.0
```
replace `v1.0.0` with the latest version tag: ![GitHub package.json version](https://img.shields.io/github/package-json/v/DCC-BS/authentication.bs.js)


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

# Only required for production
AUTH_ORIGIN=https://your_domain_name/api/auth
```

That's it! You can now use authentication.bs.js in your Nuxt app ✨

## Usage

For the API use the [Authentication for FastAPI](https://github.com/DCC-BS/authentication.bs.py) Python package. To now communcate with the backend, you can use the `defineBackendHandler` handler in the nuxt server side:
```ts
// server/api/docs.get.ts
export default defineBackendHandler({
    url: "/docs",
});
```

Now you can call these endpoint in your Nuxt clinet side:
```ts
const docs = await $fetch("/api/docs");
```
This will automatically handle the authentication for you, so you don't have to worry about iy.
This will set the `Authorization` header with the Bearer token of the authenticated user.

To use a different http method than `GET`, you can set the method in the handler:
    
```ts
// server/api/docs.post.ts
export default defineBackendHandler({
    url: "/docs",
    method: "POST", // or "PUT", "DELETE", etc.
});
```

The `defineBackendHandler` does the following three steps:
1. Redirect the body from the client to the backend.
2. Uses [`$fetch`](https://nuxt.com/docs/getting-started/data-fetching#fetch) to make the request.
3. Returns the response from the backend to the client.

these steps can be customized by passing additional options to the `defineBackendHandler` function.

**Body**

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
**Fetcher**
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
in this example the response is a sreaming response, therefore we want to use `fetch` directly to handle the response as a stream.

**Response**
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
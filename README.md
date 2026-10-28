# Algebrakit SDK for Node.js and TypeScript

[![npm](https://img.shields.io/npm/v/@algebrakit/sdk)](https://www.npmjs.com/package/@algebrakit/sdk)
[![CI](https://github.com/algebrakit/sdk-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/algebrakit/sdk-typescript/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official server-side SDK for the [Algebrakit](https://algebrakit.com) API. Your server uses it to create exercise sessions, get scores and manage sessions. Students then work on the exercises in your web page, through the Algebrakit widget.

For how Algebrakit works, the full API reference and the widget's options, see the [Algebrakit documentation](https://docs.algebrakit.com/).

> **Want to see it working first?** [algebrakit-examples](https://github.com/algebrakit/algebrakit-examples/tree/main/minimal/typescript) has a small web app built on this SDK that runs on localhost in a few minutes.

## Before you start

- Node.js 18 or newer.
- An Algebrakit API key. Don't have one yet? [Contact Algebrakit](https://algebrakit.com/contact-us).

Keep the API key on your server. Never send it to the browser.

## Install

```bash
npm install @algebrakit/sdk
```

## Quick start

Create a client and a session for an exercise:

```typescript
import { ApiClient } from '@algebrakit/sdk';

const client = new ApiClient({ apiKey: process.env.ALGEBRAKIT_API_KEY! });

const [result] = await client.createSession({
  exercises: [{ exerciseId: 'fa42e943-8213-41a6-8a91-8c22a929ffe9' }],
});
const sessionId = result.sessions[0].sessionId;
```

A session holds one student's work on one exercise. Store its ID with the student, so they can continue later and you can get their score.

### Show the session to a student

In your web page, the Algebrakit widget shows the session:

```html
<script>
  AlgebraKIT = { config: { proxy: { url: '/proxy/algebrakit' } } };
</script>
<script src="https://widgets.algebrakit.com"></script>

<akit-exercise session-id="SESSION_ID"></akit-exercise>
```

The widget sends its API calls to `/proxy/algebrakit/*` on your server. Your server adds the API key and forwards them to the Algebrakit API. The [minimal TypeScript example](https://github.com/algebrakit/algebrakit-examples/tree/main/minimal/typescript) implements all of this; for production, see [Proxy setup](https://docs.algebrakit.com/pages/420-proxy-setup/).

## API

Every method takes one request object and returns a promise. The request and response types are exported, for example `CreateSessionRequest` and `SessionScoreResponse`.

| Method | Endpoint | What it does |
|---|---|---|
| `createSession` | `POST /session/create` | Create sessions for one or more exercises: by `exerciseId`, by `exerciseSpec` (an exercise defined in code) or by `sessionId` (a copy of an existing session's exercise) |
| `getSessionScore` | `POST /session/score` | Get a session's score, and optionally lock it |
| `getSessionInfo` | `POST /session/info` | Get a session's details: its elements, the student's work and the scoring |
| `lockSession` | `POST /sessions/lock` | `LOCK`, `UNLOCK` or `FINALIZE` sessions |
| `retrieveSession` | `POST /session/retrieve` | Get existing sessions by ID |
| `validateExercise` | `POST /exercise/validate` | Check an exercise ID or specification before you use it |
| `getExercisePublishedInfo` | `POST /exercise/published-info` | Get the published versions and structure of an exercise |

### Get the score

```typescript
const { scoring } = await client.getSessionScore({ sessionId, lockSession: true });
console.log(`${scoring.marksEarned} of ${scoring.marksTotal} marks`);
```

### Lock a session

```typescript
await client.lockSession({ action: 'LOCK', sessionIds: [sessionId] });
```

## Configuration

```typescript
const client = new ApiClient({
  apiKey: process.env.ALGEBRAKIT_API_KEY!,
  baseUrl: 'https://prod.api.sg-1.algebrakit.com', // optional, see the regions below
  timeout: 10_000, // optional, in milliseconds; the default is 30000
});
```

| Region | Base URL |
|---|---|
| EU (default) | `https://api.algebrakit.com` |
| Singapore | `https://prod.api.sg-1.algebrakit.com` |

The older form `new ApiClient(baseUrl, apiKey)` still works.

## Error handling

The methods throw when a request fails. `handleApiError` turns any error into a readable line:

```typescript
import { handleApiError } from '@algebrakit/sdk';

try {
  await client.getSessionInfo({ sessionId });
} catch (error) {
  console.error(handleApiError(error));
  // API Error: 401 - Could not validate credentials: the provided api-key is not valid
}
```

The thrown error is an [`AxiosError`](https://axios-http.com/docs/handling_errors), so `error.response.status` and `error.response.data` are available too.

## More

- [algebrakit-examples](https://github.com/algebrakit/algebrakit-examples): runnable examples in TypeScript, PHP and .NET
- [Documentation](https://docs.algebrakit.com/): [SDKs](https://docs.algebrakit.com/pages/320-SDK/), [API reference](https://docs.algebrakit.com/pages/310-API/), [web components](https://docs.algebrakit.com/pages/410-webcomponents/) and [learning events](https://docs.algebrakit.com/pages/450-learning-events/)
- [OpenAPI specification](https://api.algebrakit.com/openapi/yaml)
- SDKs for other languages: [PHP](https://github.com/algebrakit/sdk-php) and [.NET](https://github.com/algebrakit/sdk-dotnet)
- A tour of every API call: [`demo/cli`](demo/cli/demo.ts). Run `npm run demo:setup`, add your API key to `demo/cli/.env`, then run `npm run demo`.

## Development

```bash
npm install
npm test            # unit tests, no API key needed
npm run typecheck
npm run build
```

To release: update the version in `package.json` and [CHANGELOG.md](CHANGELOG.md), then push a tag such as `v1.1.0`. GitHub Actions tests the package, publishes it to npm and creates a GitHub release.

## License

[MIT](LICENSE)

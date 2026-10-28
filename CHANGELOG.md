# Changelog

All notable changes to `@algebrakit/sdk` are listed here. The project follows [semantic versioning](https://semver.org).

## 1.1.0

### Added
- `new ApiClient({ apiKey, baseUrl?, timeout? })`. The base URL defaults to `https://api.algebrakit.com`, exported as `DEFAULT_BASE_URL`. The `new ApiClient(baseUrl, apiKey)` form still works.
- A request timeout, 30 seconds by default.
- Unit tests and CI. Releases are published from GitHub Actions, with npm provenance.

### Changed
- `createSession` sets `apiVersion: 2` itself, so `apiVersion` is now optional in `CreateSessionRequest`.
- Errors carry the API's own message, for example `Algebrakit API error 401: Could not validate credentials: the provided api-key is not valid`. They're still `AxiosError`s.
- `handleApiError` accepts any error and no longer prints `[object Object]` for JSON error bodies.
- Requires axios 1.20 or newer, which includes security fixes.
- Repository links point to `github.com/algebrakit/sdk-typescript`.
- The README covers how to show a session in a web page, all API methods, regions and error handling.

### Removed
- The web demo `demo/play-exercise`, replaced by the [minimal TypeScript example](https://github.com/algebrakit/algebrakit-examples/tree/main/minimal/typescript) in algebrakit-examples.

## 1.0.0

- First release: `createSession`, `getSessionScore`, `lockSession`, `getSessionInfo`, `retrieveSession`, `validateExercise` and `getExercisePublishedInfo`.

# Development Events Setup

## Problem

When testing events locally, the production API (`https://api.octile.eu.cc/events`) requires a worker signature header that only Cloudflare Workers can provide. Direct requests (even through a proxy) return 403 Forbidden.

## Solution: Dev Mode Flag

Set `"devMode": true` in `app-config.json` to:
1. Log events to console (you can see what would be sent)
2. Skip actual network requests (avoids 403 errors)
3. Allow testing event creation logic without API access

## Usage

### Setup for local development:

1. Copy the dev config template:
   ```bash
   cp app-config.local.json app-config.json
   ```
   This overwrites the production config with dev settings:
   - `apiBase: ""` (use relative paths for proxy)
   - `debug: true` (enable console logs)
   - `devMode: true` (skip event sending)

   **Note:** Don't commit this change. The repo should contain production config.

2. Start the dev server:
   ```bash
   npm run dev
   ```
   This starts a server on `http://localhost:8003` that serves static files.

3. Open **http://localhost:8003** in browser

4. Open DevTools → Console

5. You should see:
   ```
   [Analytics] Analytics initialized {appId: "bus"}
   [Analytics] Dev mode: Event created (not sent) {...}
   ```

6. The logged event shows exactly what **would** be sent in production

### Restore production config:

Before committing any changes, restore the production config:
```bash
git checkout app-config.json
```

Or manually verify:
```json
{
  "apiBase": "https://api.octile.eu.cc",
  "debug": false,
  "devMode": false
}
```

### Production Configuration

The repository's `app-config.json` should always contain production settings:

```json
{
  "apiBase": "https://api.octile.eu.cc",
  "devMode": false,
  "debug": false
}
```

**Important:** Never commit dev settings (`apiBase: ""`, `devMode: true`, `debug: true`) to the repository. These should only exist in your local working copy during development.

In production, events are sent through the authorized Cloudflare Worker with proper authentication.

### Config Validation (Guardrails)

Three layers of protection prevent devMode from accidentally being enabled in production:

**1. Build-time validation** (CI/CD)
```bash
npm run validate:config
```
This script checks:
- `devMode` must be false or absent in production
- `debug` must be false or absent in production  
- `apiBase` must be `https://api.octile.eu.cc`

The CI workflow runs this automatically and **fails the build** if validation fails.

**2. Runtime warning**

If `devMode: true` is detected on a non-localhost origin, the console shows:
```
⚠️  devMode is true in production origin - events will not be sent
```

**3. Event metadata**

All events include:
- `env: "dev" | "prod"` - determined by hostname and devMode flag
- `origin: string` - the actual origin (e.g., `https://iilha.github.io`)

This allows backend analytics to filter dev vs prod events, even if config was misconfigured.

## Alternative: Simple Python server

If you don't need the proxy server:

```bash
npm run dev:simple
```

This runs Python's http.server on port 8002.

## Production

On the production site (`https://iilha.github.io/bus/`):
- Set `"apiBase": "https://api.octile.eu.cc"` 
- Set `"devMode": false` (or remove it)
- Events are sent through the authorized Cloudflare Worker with proper signatures

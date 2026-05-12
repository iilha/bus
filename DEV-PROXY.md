# Development Events Setup

## Problem

When testing events locally, the production API (`https://api.octile.eu.cc/events`) requires a worker signature header that only Cloudflare Workers can provide. Direct requests (even through a proxy) return 403 Forbidden.

## Solution: Dev Mode Flag

Set `"devMode": true` in `app-config.json` to:
1. Log events to console (you can see what would be sent)
2. Skip actual network requests (avoids 403 errors)
3. Allow testing event creation logic without API access

## Usage

### Start the dev server:

```bash
npm run dev
```

This starts a server on `http://localhost:8003` that serves static files.

### Test events in dev mode:

1. Ensure `app-config.json` has:
   ```json
   {
     "debug": true,
     "devMode": true
   }
   ```

2. Open **http://localhost:8003** in browser

3. Open DevTools → Console

4. You should see:
   ```
   [Analytics] Analytics initialized {appId: "bus"}
   [Analytics] Dev mode: Event created (not sent) {...}
   ```

5. The logged event shows exactly what **would** be sent in production

### Production Configuration

Before deploying to production, update `app-config.json`:

```json
{
  "apiBase": "https://api.octile.eu.cc",
  "devMode": false,
  "debug": false
}
```

Or simply remove `devMode` (defaults to false). Events will then be sent through the production Cloudflare Worker with proper authentication.

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

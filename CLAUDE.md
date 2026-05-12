# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taiwan Bus is a Progressive Web App (PWA) for viewing nearby bus stops and real-time arrivals across 22 cities in Taiwan. The app uses vanilla JavaScript (no build step) and can be deployed as a web app, Android APK/AAB, or iOS app.

**Core Architecture:**
- **Frontend**: Pure HTML/CSS/JavaScript (ES6+), no build tools required
- **Map**: Leaflet.js with OpenStreetMap tiles
- **Data Source**: TDX (Transport Data eXchange) API via Cloudflare Worker proxy
- **PWA**: Service Worker (`sw.js`) with cache-first strategy for assets
- **Native Apps**: WebView wrappers for Android and iOS with OTA update support

## Development Commands

### Local Development
```bash
# Start local dev server (no build required)
python3 -m http.server 8002
# Access at http://localhost:8002
```

### Testing
```bash
# Run Playwright tests
npm test
# or
npx playwright test

# Run tests with browser visible
npm run test:headed
# or
npx playwright test --headed
```

### Android Build
```bash
# Build debug APK
cd android
./gradlew assembleDebug

# Build release APK (requires KEYSTORE_PASSWORD env var)
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease

# Clean build artifacts
./gradlew clean
```

**Important:** Always run `./android/sync-web.sh` before building Android to sync web assets into the Android project. CI does this automatically.

### Validation
```bash
# Validate i18n keys consistency
node scripts/validate-i18n.js
```

## Key Architecture Concepts

### Module Structure
The codebase is organized into standalone JavaScript modules loaded via script tags:

- **`js/bus.js`**: Main controller - handles TDX API calls, route data, stop fetching, map initialization, and bottom sheet coordination
- **`js/common.js`**: Shared utilities across all transport modes - city configurations, language detection, localStorage keys
- **`js/bottom-sheet.js`**: Mobile-only draggable bottom sheet component with snap points (collapsed/half/full)
- **`js/analytics.js`**: Event tracking to Cloudflare Worker endpoint
- **`js/health.js`**: Health check pings to backend
- **`js/ota.js`**: Over-the-air update checker for native apps (checks `version.json`)
- **`js/uuid.js`**: Client UUID generation/storage

### Data Flow Pattern
1. User selects city → `bus.js` checks localStorage cache (24h TTL)
2. If cache miss → fetch from TDX proxy with exponential backoff retry
3. Response cached in localStorage + rendered to UI
4. User location → fetch nearby stops within radius → display on map + list
5. Bottom sheet (mobile only) provides draggable interface for stop details

### TDX API Integration
- **Proxy URL**: `https://tdx-proxy.owen-ouyang.workers.dev`
- **Rate Limiting**: 429 responses trigger exponential backoff (1s → 2s → 4s)
- **Caching**: Routes cached 24h in localStorage, arrivals fetched fresh (network-first)
- The proxy handles OAuth 2.0 authentication to avoid exposing credentials

### PWA Caching Strategy (`sw.js`)
- **Static assets** (HTML/JS/CSS): Cache-first with 24h TTL
- **Map tiles**: Cache-first with 7-day TTL
- **TDX API calls**: Network-first with cache fallback
- Cache version bumps trigger automatic cleanup of old caches

### Internationalization (i18n)
- Supported languages: English (`en`), Traditional Chinese (`zh`)
- Translation files: `i18n/en.json`, `i18n/zh.json`
- HTML elements use `data-i18n="key"` attributes
- `scripts/validate-i18n.js` ensures all HTML keys exist in both JSON files
- Language detection: localStorage → browser language → fallback to English

### Android WebView Architecture
- **Package ID**: `tw.pwa.bus`
- **Min SDK**: 24 (Android 7.0), **Target SDK**: 35
- **MainActivity.java**: WebView wrapper with:
  - Location permissions handling
  - File access for local assets
  - JavaScript bridge for native features
  - OTA update detection via `version.json`
- **Build variants**:
  - Debug: Points to `http://10.0.2.2:8080/` for local testing
  - Release: Points to `https://iilha.github.io/bus/`
- **Asset sync**: `android/sync-web.sh` copies web files into `app/src/main/assets/`

### iOS WebView Architecture
- Similar to Android: WebView wrapper with asset syncing via `ios/sync-web.sh`
- Requires proper provisioning profiles for App Store distribution

## Configuration Files

### `app-config.json`
Central configuration loaded by analytics/health modules:
- `apiBase`: Backend API for health checks
- `workerUrl`: Analytics endpoint
- `features.events`: Toggle event tracking
- `supportEmail`: Contact for support
- `playStoreUrl`: Link to Play Store listing

### `version.json`
OTA update metadata for native apps:
- `otaVersionCode`: Integer version code
- `otaVersionName`: Human-readable version (e.g., "2026.05.05")
- `minNativeVersionCode`: Minimum native app version required
- `forceUpdate`: Boolean flag to force immediate update
- `releaseNotes`: i18n release notes object

### `manifest.webapp`
PWA manifest defining app metadata, icons, theme colors, and display mode.

## Important Patterns

### Bottom Sheet Behavior
- **Mobile only** (≤768px): Replaces side panel with draggable sheet
- **Desktop** (>768px): Traditional fixed side panel
- Snap points: `collapsed` (peek), `half` (50vh), `full` (90vh)
- Gesture detection: Touch events with velocity calculation for fling behavior
- Auto-disables and restores panel layout on resize

### Rate Limiting & Retry Logic
All TDX API calls use `fetchWithRetry()` which:
- Retries up to 3 times with exponential backoff (1s, 2s, 4s)
- Handles 429 rate limit responses gracefully
- Returns last response if all retries exhausted (caller handles gracefully)

### City & Route Caching
- Routes are cached per-city in localStorage with `ROUTE_CACHE_KEY`
- Cache includes timestamp for TTL validation (24h)
- City changes debounced (300ms) to avoid excessive API calls
- Cache structure: `{ [cityId]: { timestamp, routes: [...] } }`

## CI/CD Workflows

### `.github/workflows/build-android.yml`
Triggered on push to `main` when Android/web files change:
1. Sync web assets via `android/sync-web.sh`
2. Validate i18n with `scripts/validate-i18n.js`
3. Build debug APK + release APK + signed AAB
4. Upload artifacts to GitHub Actions
5. Create GitHub release with APK/AAB for main branch commits

### `.github/workflows/build-ios.yml`
Similar workflow for iOS builds (not fully detailed in this repo).

## Code Style Notes

- **No build tools**: All code must run directly in the browser
- **ES6+ syntax**: Use modern JavaScript (const/let, arrow functions, async/await)
- **Strict mode**: All JS files use `'use strict';` at the top
- **Comments**: Use JSDoc-style comments for functions and configuration blocks
- **Error handling**: Always log errors to console with `[Module]` prefix for traceability
- **Debouncing**: Use debounce utility for user input events (city selector, search)

## Common Gotchas

1. **Java Version**: Android builds require Java 21 (set in `build.gradle`)
2. **Service Worker Updates**: Bump `CACHE_VERSION` in `sw.js` to force cache invalidation
3. **i18n Validation**: Always run `node scripts/validate-i18n.js` before committing HTML changes with `data-i18n` attributes
4. **Asset Sync**: Never manually copy files to `android/app/src/main/assets/` - always use `sync-web.sh`
5. **localStorage Keys**: Defined in `common.js` as `STORAGE_KEYS` - use these constants, don't hardcode strings
6. **Map Marker Cleanup**: Always call `marker.remove()` before clearing marker arrays to avoid Leaflet memory leaks

## Testing Notes

- Playwright config uses `python3 -m http.server 8002` as test server
- Tests located in `tests/app.spec.js`
- Screenshots saved on test failure for debugging
- Base URL: `http://localhost:8002`

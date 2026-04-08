# Taiwan Bus Design Document

## Architecture Overview

Taiwan Bus is a Progressive Web App (PWA) that displays city bus route schedules and real-time arrival information. Built with vanilla JavaScript, HTML5, and Leaflet maps, the app provides two primary views:

- **Route Schedule Tab**: Browse bus routes by city, view stops with trip planning and ETA calculations
- **Nearby Stops Tab**: Locate nearby bus stops with live arrival times via TDX API

The app can be served via HTTP (GitHub Pages), loaded in native WebView wrappers (Android/iOS), or installed as a PWA. It operates as a static single-page application with client-side data fetching.

## Data Flow

### Data Sources
- **TDX Transport Data Exchange API**: `https://tdx.transportdata.tw/api/...`
  - Routes: `/v2/Bus/Route/City/{City}`
  - Stops: `/v2/Bus/Stop/City/{City}`
  - Real-time arrivals: `/v2/Bus/EstimatedTimeOfArrival/City/{City}`
  - Authentication: OAuth 2.0 via Cloudflare Worker proxy
  - Fallback: Demo data embedded in JavaScript for offline mode

### Fetch-Render Cycle
1. **Route Schedule**: User selects city → fetch routes → select route → fetch stops → render with ETA
2. **Nearby Stops**: Get user GPS → fetch stops within radius → fetch arrivals for visible stops → render badges
3. API proxy at `workers/tdx-proxy.js` handles authentication and CORS
4. Network-first strategy: try live API, fall back to demo data on failure
5. Real-time arrivals refresh every 30 seconds via `setInterval()`

### Trip Planning Logic
- User selects origin and destination stops from route schedule
- App calculates trip-specific fare and duration based on stop sequence
- Highlights stops: green (board), red (alight), yellow (in-trip)
- ETA at each stop calculated from next bus departure time + cumulative travel time

## UI Components

### Navigation Header
- Language toggle button (EN/中文)
- Links to other transport apps (YouBike, MRT, Rail, THSR)
- Active state highlighting for current page

### Route Schedule Tab
- **City Selector**: Dropdown for 6 major cities (Taipei, Taoyuan, Taichung, Tainan, Kaohsiung, Keelung)
- **Route Search**: Text input with fuzzy matching on route number/name
- **Origin/Destination Selectors**: Dropdowns populated from selected route's stops
- **Stop List**: Scrollable list with stop names, arrival times, fare, duration
- **Map Integration**: Leaflet map with route polyline and stop markers

### Nearby Stops Tab
- **Map View**: Centered on user GPS location with stop markers
- **Stop List**: Distance-sorted with real-time arrival badges
- **Arrival Badges**: Color-coded countdown (green: >5min, yellow: 2-5min, red: <2min, gray: approaching)
- **Locate Button**: Bottom-right floating button to recenter map

### Mobile Bottom Sheet (≤768px)
- Draggable panel with snap points: collapsed (56px), half (50vh), full (90vh)
- Summary line in collapsed state: "🚌 {City} • {RouteCount} routes"
- Touch event handlers for smooth drag gestures

## Caching Strategy

### Service Worker (`sw.js`)
| Resource Type | Strategy | TTL |
|---------------|----------|-----|
| Static assets (HTML, CSS, JS) | Cache-first | 24 hours |
| Map tiles (OSM) | Cache-first | 7 days |
| TDX API routes/stops | Network-first | 30 seconds |
| TDX API arrivals | Network-first | 30 seconds |

### Network-First Logic
1. Attempt network fetch with 5-second timeout
2. On success: update cache and return response
3. On failure: serve from cache if available
4. If cache miss: show demo data fallback
5. Arrival data never cached (always real-time)

### Demo Data Fallback
- Embedded static JSON for 3 popular routes per city (18 total)
- Includes route info, stops, schedules with mock arrival times
- Activated when TDX API unavailable or rate-limited

## Localization

### Language Toggle
- Default: `navigator.language` (zh-TW/zh-CN → Chinese, else English)
- Persistence: `localStorage.setItem('bus-lang', lang)`
- Text elements: `data-en` and `data-zh` HTML attributes
- Route names, stop names, UI labels all bilingual

### Implementation
```javascript
document.querySelectorAll('[data-en]').forEach(el => {
  el.textContent = lang === 'zh' ? el.dataset.zh : el.dataset.en;
});
```

## Native Wrappers

### Android WebView
- Loads `file:///android_asset/index.html` from APK assets
- WebView settings: JavaScript enabled, geolocation permission, DOM storage
- JavaScript bridge: `Android.shareRoute(routeId)` for native share sheet
- Background location updates for stop proximity alerts

### iOS WKWebView
- Loads local HTML via `WKWebView.loadFileURL()` from app bundle
- Configuration: `allowsBackForwardNavigationGestures`, `allowsInlineMediaPlayback`
- Swift bridge: `window.webkit.messageHandlers.shareRoute.postMessage(routeId)`
- Core Location integration for continuous GPS tracking

### Asset Sync
- CI/CD: GitHub Actions copies web build to native repos on merge
- Git submodule: `ios/Bus/Resources/` and `android/app/src/main/assets/`
- Build verification: checksums ensure asset integrity

## State Management

### localStorage Keys
| Key | Purpose | Values |
|-----|---------|--------|
| `bus-lang` | Language preference | `'en'` \| `'zh'` |
| `bus-city` | Selected city | City code (e.g., `'Taipei'`) |
| `bus-route` | Selected route ID | Route code (e.g., `'1'`) |
| `bus-tab` | Active tab | `'schedule'` \| `'nearby'` |

### In-Memory State
- `userLocation`: GPS coordinates `{lat, lng}` from Geolocation API
- `allRoutes`: Full route list for selected city (fetched from TDX)
- `routeStops`: Stop sequence for selected route
- `nearbyStops`: Stops within 500m radius of user location
- `arrivalData`: Real-time ETA map keyed by stop ID
- `arrivalTimer`: `setInterval()` ID for 30-second refresh

### State Persistence
- City, route, tab: persisted to localStorage on selection
- User location: ephemeral, re-requested each session
- API data: not persisted (always fetch fresh for accuracy)
- Demo data: hardcoded fallback, immutable

## Future Plan

### Short-term
- Add bus route favorites for quick access
- Show real-time bus positions on map (live GPS tracking)
- Implement arrival time push notifications
- Add transfer suggestions between routes

### Medium-term
- Multi-route trip planner (origin to destination with transfers)
- Fare calculator across multiple segments
- Integration with MRT for last-mile connections
- Offline timetable support for saved routes

### Long-term
- Crowdsourced bus crowding data
- Predictive delay estimation
- Voice announcements for approaching stops

## TODO

- [ ] Add route favorite/bookmark feature
- [ ] Implement bus GPS position overlay on map
- [ ] Add arrival notification with configurable lead time
- [ ] Support intercity bus routes
- [ ] Add accessibility info per stop
- [ ] Optimize route data caching (reduce API calls)
- [ ] Add dark mode

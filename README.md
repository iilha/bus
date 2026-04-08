# Taiwan Bus

Progressive Web App for Taiwan city bus nearby stops and real-time arrivals.

## Features

### Route Schedule
- Origin/destination stop selectors with search
- Trip-specific fare and duration calculation
- ETA at each stop based on next bus departure
- Stop highlighting (green=board, red=alight, yellow=in-trip)

### Nearby Stops
- Real-time arrival data from TDX API
- Distance-sorted stop list with arrival countdowns
- Leaflet map with interactive markers

### UI/UX
- 22 cities across Taiwan (major cities + counties)
- Direction toggle (inbound/outbound)
- Mobile bottom sheet with drag gestures (collapsed/half/full snap points)
- Bilingual support (English/Chinese)
- Locate button to center map on user location

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Map**: Leaflet 1.9.4, OpenStreetMap tiles
- **PWA**: Service Worker, Web App Manifest
- **APIs**: TDX (Transport Data eXchange) via Cloudflare Worker proxy

## Quick Start

```bash
python3 -m http.server 8002
```

Open `http://localhost:8002` in a browser. No build required.

## Project Structure

```
bus/
├── index.html              # Main page
├── js/
│   ├── bus.js              # Main controller logic
│   ├── common.js           # Shared utilities
│   └── bottom-sheet.js     # Mobile bottom sheet component
├── sw.js                   # Service worker (caching)
├── manifest.webapp         # PWA manifest
├── android/                # Android native build
│   ├── app/
│   └── build.gradle        # Package: tw.pwa.bus
├── ios/                    # iOS native build
└── tests/
    └── app.spec.js         # Playwright tests
```

## Native Builds

### Android
- Package ID: `tw.pwa.bus`
- Min SDK: 24 (Android 7.0)
- Target SDK: 35

Build:
```bash
cd android
./gradlew assembleRelease
```

### iOS
Native WebView wrapper for iOS app distribution.

## Testing

```bash
npx playwright test
npx playwright test --headed
```

## APIs

### TDX (Transport Data eXchange)
Real-time bus arrival data via Cloudflare Worker proxy. The worker handles OAuth 2.0 authentication and forwards requests to `tdx.transportdata.tw/api/basic/v2/Bus/*`.

### Caching Strategy
- Static assets: Cache-first (24h TTL)
- Map tiles: Cache-first (7d TTL)
- TDX API: Network-first with fallback to cache

## Cities Supported

22 cities/counties:
- Major: Taipei, New Taipei, Taoyuan, Taichung, Tainan, Kaohsiung, Keelung, Hsinchu
- Counties: Hsinchu County, Miaoli, Changhua, Nantou, Yunlin, Chiayi County, Chiayi City, Pingtung, Yilan, Hualien, Taitung
- Islands: Kinmen, Penghu, Lianjiang

## License

MIT

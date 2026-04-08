[English](README.md) | 繁體中文

# 台灣公車

台灣城市公車附近站牌與即時到站資訊的漸進式網頁應用程式（PWA）。

## 功能特色

### 路線時刻表
- 起迄站選擇器並支援搜尋功能
- 單趟車資與行車時間計算
- 根據下班車出發時間計算各站預估到達時間（ETA）
- 站牌顯色標示（綠色=上車站、紅色=下車站、黃色=行駛中）

### 附近站牌
- 來自 TDX API 的即時到站資料
- 依距離排序的站牌清單與到站倒數計時
- 支援互動式標記的 Leaflet 地圖

### 使用者介面
- 涵蓋台灣 22 個縣市（主要城市 + 縣市）
- 方向切換（去程/返程）
- 行動裝置底部面板支援拖曳手勢（收合/半展開/全展開三段式定位）
- 雙語支援（英文/中文）
- 定位按鈕可將地圖中心點移至使用者位置

## 技術架構

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **地圖**: Leaflet 1.9.4, OpenStreetMap 圖磚
- **PWA**: Service Worker, Web App Manifest
- **APIs**: TDX（運輸資料流通服務）透過 Cloudflare Worker 代理

## 快速開始

```bash
python3 -m http.server 8002
```

在瀏覽器開啟 `http://localhost:8002`。無需建置。

## 專案結構

```
bus/
├── index.html              # 主頁面
├── js/
│   ├── bus.js              # 主控制邏輯
│   ├── common.js           # 共用工具函式
│   └── bottom-sheet.js     # 行動裝置底部面板元件
├── sw.js                   # Service worker（快取）
├── manifest.webapp         # PWA 設定檔
├── android/                # Android 原生建置
│   ├── app/
│   └── build.gradle        # 套件名稱: tw.pwa.bus
├── ios/                    # iOS 原生建置
└── tests/
    └── app.spec.js         # Playwright 測試
```

## 原生應用程式建置

### Android
- 套件 ID: `tw.pwa.bus`
- 最低 SDK: 24 (Android 7.0)
- 目標 SDK: 35

建置方式：
```bash
cd android
./gradlew assembleRelease
```

### iOS
用於 iOS 應用程式發布的原生 WebView 封裝。

## 測試

```bash
npx playwright test
npx playwright test --headed
```

## APIs

### TDX（運輸資料流通服務）
透過 Cloudflare Worker 代理的即時公車到站資料。Worker 處理 OAuth 2.0 驗證並轉發請求至 `tdx.transportdata.tw/api/basic/v2/Bus/*`。

### 快取策略
- 靜態資源: Cache-first（24小時 TTL）
- 地圖圖磚: Cache-first（7天 TTL）
- TDX API: Network-first 並備援至快取

## 支援城市

22 個縣市：
- 主要城市：台北市、新北市、桃園市、台中市、台南市、高雄市、基隆市、新竹市
- 縣市：新竹縣、苗栗縣、彰化縣、南投縣、雲林縣、嘉義縣、嘉義市、屏東縣、宜蘭縣、花蓮縣、台東縣
- 離島：金門縣、澎湖縣、連江縣

## 授權

MIT
